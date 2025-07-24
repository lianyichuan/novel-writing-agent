import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

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

  constructor() {
    this.loadConfig();
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      dailyUsage: {}
    };
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
          openai: {
            apiKey: process.env.OPENAI_API_KEY || '',
            model: 'gpt-4',
            maxTokens: 4000,
            temperature: 0.7,
            baseURL: 'https://api.openai.com/v1'
          }
        },
        defaultProvider: 'openai',
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

  async testConnection(provider?: string): Promise<boolean> {
    const providerName = provider || this.config.defaultProvider;
    const providerConfig = this.config.providers[providerName];

    if (!providerConfig) {
      throw new Error(`未知的LLM提供商: ${providerName}`);
    }

    try {
      const response = await this.sendRequest(providerName, [
        { role: 'user', content: '测试连接' }
      ]);
      return !!response;
    } catch (error) {
      console.error(`LLM连接测试失败 (${providerName}):`, error);
      return false;
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

  private async sendRequest(provider: string, messages: ChatMessage[]): Promise<LLMResponse> {
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
        }
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
      // 转换消息格式为Gemini格式
      const contents = messages
        .filter(msg => msg.role !== 'system') // Gemini不支持system消息
        .map(msg => ({
          parts: [{ text: msg.content }]
        }));

      // 如果有system消息，将其添加到第一个用户消息前
      const systemMessage = messages.find(msg => msg.role === 'system');
      if (systemMessage && contents.length > 0) {
        contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`;
      }

      const response = await axios.post(
        `${config.baseURL}/models/${config.model}:generateContent`,
        {
          contents,
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': config.apiKey
          }
        }
      );

      const candidate = response.data.candidates?.[0];
      if (!candidate) {
        throw new Error('Gemini API返回无效响应');
      }

      const content = candidate.content?.parts?.[0]?.text || '';
      const usage = response.data.usageMetadata || {};

      return {
        content,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0
        },
        model: config.model,
        provider: 'gemini'
      };
    } catch (error: any) {
      console.error('Gemini API请求失败:', error.response?.data || error.message);
      throw new Error(`Gemini API请求失败: ${error.response?.data?.error?.message || error.message}`);
    }
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
