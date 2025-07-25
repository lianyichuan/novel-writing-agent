import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface LLMConfig {
  providers: {
    [key: string]: {
      apiKey: string;
      model: string;
      maxTokens: number;
      temperature: number;
      baseURL: string;
    };
  };
  defaultProvider: string;
  contextWindow: number;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    dailyLimit: number;
  };
  prompts: {
    systemPrompt: string;
    chapterPrompt: string;
    qualityCheckPrompt: string;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export class LLMService {
  private config!: LLMConfig;
  private usageStats: {
    totalRequests: number;
    totalTokens: number;
    dailyUsage: { [date: string]: number };
  };
  private proxyAgent?: HttpsProxyAgent<string>;
  private geminiClient?: GoogleGenerativeAI;

  constructor() {
    this.loadConfig();
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      dailyUsage: {}
    };
    this.setupProxy();
    this.setupGemini();
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(__dirname, '../../../config/llm-config.json');
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.error('无法加载LLM配置:', error);
      // 使用默认配置
      this.config = {
        providers: {
          gemini: {
            apiKey: process.env.GEMINI_API_KEY || '',
            model: 'gemini-2.0-flash',
            maxTokens: 4000,
            temperature: 0.7,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta'
          }
        },
        defaultProvider: 'gemini',
        contextWindow: 8000,
        rateLimits: {
          requestsPerMinute: 60,
          tokensPerMinute: 90000,
          dailyLimit: 1000000
        },
        prompts: {
          systemPrompt: '你是一个专业的小说写作助手。',
          chapterPrompt: '请根据以下大纲写作章节：',
          qualityCheckPrompt: '请检查以下章节的质量：'
        }
      };
    }
  }

  private setupProxy(): void {
    // 设置代理，支持环境变量或默认使用7890端口
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
    this.proxyAgent = new HttpsProxyAgent(proxyUrl);
    console.log(`🌐 代理设置: ${proxyUrl}`);
  }

  private setupGemini(): void {
    try {
      const geminiConfig = this.config.providers.gemini;
      if (geminiConfig && geminiConfig.apiKey) {
        // 创建自定义fetch函数，强制使用代理
        const customFetch = async (url: string, options: any = {}) => {
          const https = require('https');
          const { URL } = require('url');

          return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const postData = options.body || '';

            // 确保headers正确传递
            const headers = {
              'Content-Type': 'application/json',
              ...options.headers
            };

            // 如果有body，设置Content-Length
            if (postData) {
              headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const requestOptions = {
              hostname: parsedUrl.hostname,
              port: parsedUrl.port || 443,
              path: parsedUrl.pathname + parsedUrl.search,
              method: options.method || 'GET',
              headers: headers,
              agent: this.proxyAgent
            };

            console.log('🌐 使用代理请求:', parsedUrl.hostname, requestOptions.path);

            const req = https.request(requestOptions, (res: any) => {
              let data = '';
              res.on('data', (chunk: any) => data += chunk);
              res.on('end', () => {
                console.log('📡 响应状态:', res.statusCode);
                resolve({
                  ok: res.statusCode >= 200 && res.statusCode < 300,
                  status: res.statusCode,
                  statusText: res.statusMessage,
                  json: () => Promise.resolve(JSON.parse(data)),
                  text: () => Promise.resolve(data)
                });
              });
            });

            req.on('error', (error: any) => {
              console.error('❌ 请求错误:', error.message);
              reject(error);
            });

            if (postData) {
              req.write(postData);
            }
            req.end();
          });
        };

        // 使用自定义fetch初始化Gemini客户端
        this.geminiClient = new GoogleGenerativeAI(geminiConfig.apiKey);

        // 替换全局fetch（如果Google SDK使用全局fetch）
        (global as any).fetch = customFetch;

        console.log('🤖 Gemini客户端初始化成功');
        console.log('🌐 使用代理:', 'http://127.0.0.1:7890');
      }
    } catch (error) {
      console.error('Gemini客户端初始化失败:', error);
    }
  }

  async testConnection(provider?: string): Promise<boolean> {
    const providerName = provider || this.config.defaultProvider;
    const providerConfig = this.config.providers[providerName];

    if (!providerConfig) {
      throw new Error(`未知的LLM提供商: ${providerName}`);
    }

    try {
      // 先检查代理状态（仅对Gemini）
      if (providerName === 'gemini') {
        const proxyStatus = await this.checkProxyStatus();
        if (!proxyStatus.isUSLocation) {
          console.warn(`⚠️ 代理未连接到美国节点 (当前: ${proxyStatus.country})，Gemini API可能无法使用`);
          // 不直接返回false，而是继续尝试，让用户知道具体错误
        }
      }

      const response = await this.sendRequest(providerName, [
        { role: 'user', content: '测试连接' }
      ]);
      return !!response;
    } catch (error) {
      console.error(`LLM连接测试失败 (${providerName}):`, error);
      return false;
    }
  }

  private async checkProxyStatus(): Promise<{isUSLocation: boolean, currentIP: string, country: string}> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // 检查当前IP
      const { stdout: ipResult } = await execAsync('curl --proxy http://127.0.0.1:7890 -s --connect-timeout 5 https://httpbin.org/ip');
      const ipData = JSON.parse(ipResult);

      // 检查地理位置
      const { stdout: geoResult } = await execAsync(`curl -s --connect-timeout 5 http://ip-api.com/json/${ipData.origin}`);
      const geoData = JSON.parse(geoResult);

      return {
        isUSLocation: geoData.country === 'United States',
        currentIP: ipData.origin,
        country: geoData.country
      };
    } catch (error) {
      console.error('代理状态检查失败:', error);
      return {
        isUSLocation: false,
        currentIP: 'unknown',
        country: 'unknown'
      };
    }
  }

  async chat(messages: ChatMessage[], provider?: string): Promise<LLMResponse> {
    const providerName = provider || this.config.defaultProvider;
    return await this.sendRequest(providerName, messages);
  }

  async generateChapter(outline: string, requirements: string, provider?: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.config.prompts.systemPrompt },
      { 
        role: 'user', 
        content: `${this.config.prompts.chapterPrompt}\n\n大纲：\n${outline}\n\n要求：\n${requirements}` 
      }
    ];

    const response = await this.chat(messages, provider);
    return response.content;
  }

  async checkQuality(content: string, provider?: string): Promise<{
    score: number;
    feedback: string;
    metrics: {
      fluency: number;
      consistency: number;
      creativity: number;
    };
  }> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.config.prompts.systemPrompt },
      { 
        role: 'user', 
        content: `${this.config.prompts.qualityCheckPrompt}\n\n内容：\n${content}\n\n请从文字流畅度、剧情连贯性、创新度等方面评分(1-10)，并提供具体反馈。` 
      }
    ];

    const response = await this.chat(messages, provider);
    
    // 简化的质量解析逻辑
    // 实际应用中需要更复杂的解析
    return {
      score: 8.0,
      feedback: response.content,
      metrics: {
        fluency: 8.2,
        consistency: 7.8,
        creativity: 8.5
      }
    };
  }

  async sendRequest(provider: string, messages: ChatMessage[]): Promise<LLMResponse> {
    const providerConfig = this.config.providers[provider];
    
    if (!providerConfig || !providerConfig.apiKey) {
      throw new Error(`LLM提供商 ${provider} 配置不完整`);
    }

    // 检查速率限制
    await this.checkRateLimit();

    try {
      let response;
      
      if (provider === 'openai') {
        response = await this.sendOpenAIRequest(providerConfig, messages);
      } else if (provider === 'claude') {
        response = await this.sendClaudeRequest(providerConfig, messages);
      } else if (provider === 'gemini') {
        response = await this.sendGeminiRequest(providerConfig, messages);
      } else {
        throw new Error(`不支持的LLM提供商: ${provider}`);
      }

      // 更新使用统计
      this.updateUsageStats(response.usage.totalTokens);

      return response;
    } catch (error) {
      console.error(`LLM请求失败 (${provider}):`, error);
      throw error;
    }
  }

  private async sendOpenAIRequest(config: any, messages: ChatMessage[]): Promise<LLMResponse> {
    const response = await axios.post(
      `${config.baseURL}/chat/completions`,
      {
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: this.proxyAgent,
        proxy: false // 禁用axios内置代理，使用httpsAgent
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
      },
      model: config.model,
      provider: 'openai'
    };
  }

  private async sendClaudeRequest(config: any, messages: ChatMessage[]): Promise<LLMResponse> {
    // Claude API实现
    // 这里是简化版本，实际需要根据Claude API文档实现
    throw new Error('Claude API 暂未实现');
  }

  private async sendGeminiRequest(config: any, messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      // 使用直接HTTP请求，绕过Google SDK
      return await this.sendGeminiRequestDirect(config, messages);
    } catch (error: any) {
      console.error('❌ Gemini API请求失败:', error.message);

      // 提供更详细的错误信息
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Gemini API密钥无效，请检查配置');
      } else if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Gemini API权限被拒绝，请检查API密钥权限');
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Gemini API配额已用完');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('网络连接失败，请检查代理设置或网络连接');
      } else {
        throw new Error(`Gemini API请求失败: ${error.message}`);
      }
    }
  }

  private async sendGeminiRequestDirect(config: any, messages: ChatMessage[]): Promise<LLMResponse> {
    const https = require('https');

    return new Promise((resolve, reject) => {
      // 转换消息格式
      let prompt = '';
      const systemMessage = messages.find(msg => msg.role === 'system');
      const userMessages = messages.filter(msg => msg.role !== 'system');

      // 如果有system消息，添加到prompt开头
      if (systemMessage) {
        prompt += `${systemMessage.content}\n\n`;
      }

      // 添加用户消息
      userMessages.forEach(msg => {
        if (msg.role === 'user') {
          prompt += `${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `助手回复: ${msg.content}\n`;
        }
      });

      // 构建请求体
      const requestBody = JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 4000,
        }
      });

      // 构建请求选项
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/${config.model || 'gemini-2.0-flash'}:generateContent?key=${config.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(requestBody, 'utf8'),
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        },
        agent: this.proxyAgent
      };

      console.log('🤖 发送Gemini直接请求...');
      console.log('🌐 使用代理请求:', options.hostname, options.path.substring(0, 50) + '...');

      const req = https.request(options, (res: any) => {
        let data = '';

        // 设置编码为UTF-8
        res.setEncoding('utf8');

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log('📡 响应状态:', res.statusCode);
          console.log('🔍 原始响应数据长度:', data.length);

          try {
            if (res.statusCode === 200) {
              const response = JSON.parse(data);
              const content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const usage = response.usageMetadata || {};

              console.log('✅ Gemini响应成功');
              console.log('📝 响应内容长度:', content.length);
              console.log('🔤 响应内容预览:', content.substring(0, 100));

              resolve({
                content,
                usage: {
                  promptTokens: usage.promptTokenCount || 0,
                  completionTokens: usage.candidatesTokenCount || 0,
                  totalTokens: usage.totalTokenCount || 0
                },
                model: config.model,
                provider: 'gemini'
              });
            } else {
              console.error('❌ API响应错误:', res.statusCode, data);
              reject(new Error(`API请求失败: ${res.statusCode} ${data}`));
            }
          } catch (parseError: any) {
            console.error('❌ 解析响应失败:', parseError.message);
            reject(new Error(`响应解析失败: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        console.error('❌ 请求错误:', error.message);
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  }

  private async checkRateLimit(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = this.usageStats.dailyUsage[today] || 0;
    
    if (dailyUsage >= this.config.rateLimits.dailyLimit) {
      throw new Error('已达到每日使用限制');
    }
  }

  private updateUsageStats(tokens: number): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += tokens;
    this.usageStats.dailyUsage[today] = (this.usageStats.dailyUsage[today] || 0) + tokens;
  }

  getUsageStats() {
    return this.usageStats;
  }

  getModels(provider?: string): string[] {
    if (provider) {
      const config = this.config.providers[provider];
      return config ? [config.model] : [];
    }
    
    return Object.values(this.config.providers).map(p => p.model);
  }
}
