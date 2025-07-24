import { LLMService } from './LLMService';
import { DocumentService } from './DocumentService';

export interface ExtractedCharacterInfo {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  level?: string;
  age?: number;
  description: string;
  relationships: {
    target: string;
    type: 'family' | 'friend' | 'enemy' | 'lover' | 'master' | 'disciple' | 'ally';
    description: string;
    strength: number; // 1-10
  }[];
  currentStatus: string;
  importance: number; // 1-10
}

export interface ExtractedPlotInfo {
  name: string;
  description: string;
  currentChapter: number;
  progress: number; // 0-100
  status: 'active' | 'pending' | 'completed' | 'paused';
  keyEvents: string[];
  nextPlannedEvents: string[];
  relatedCharacters: string[];
}

export class DocumentAnalysisService {
  private llmService: LLMService;
  private documentService: DocumentService;
  private analysisCache: Map<string, any> = new Map();

  constructor() {
    this.llmService = new LLMService();
    this.documentService = new DocumentService();
  }

  /**
   * 从人物关系文档中提取人物信息
   */
  async extractCharactersFromDocument(): Promise<ExtractedCharacterInfo[]> {
    try {
      const characterDoc = await this.documentService.getDocument('character-relations');
      if (!characterDoc || !characterDoc.content) {
        console.warn('人物关系文档不存在或为空');
        return [];
      }

      const cacheKey = `characters_${characterDoc.lastModified.getTime()}`;
      if (this.analysisCache.has(cacheKey)) {
        return this.analysisCache.get(cacheKey);
      }

      console.log('🤖 开始分析人物关系文档...');

      const prompt = `
请分析以下《龙渊谷变》人物关系文档，提取主要人物信息。

文档内容：
${characterDoc.content.substring(0, 3000)}...

请返回JSON数组，只包含重要人物（importance >= 7），每个人物格式：
{
  "name": "人物姓名",
  "role": "protagonist|antagonist|supporting|minor",
  "level": "修炼等级",
  "description": "简短描述（不超过50字）",
  "relationships": [{"target": "关系对象", "type": "关系类型", "strength": 数字}],
  "currentStatus": "当前状态",
  "importance": 重要程度1-10
}

只返回纯JSON数组，不要markdown标记。
`;

      const response = await this.llmService.sendRequest('gemini', [
        { role: 'user', content: prompt }
      ]);

      try {
        // 清理响应内容，移除markdown标记
        let cleanContent = response.content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const characters = JSON.parse(cleanContent);
        this.analysisCache.set(cacheKey, characters);
        console.log(`✅ 成功提取 ${characters.length} 个人物信息`);
        return characters;
      } catch (parseError) {
        console.error('❌ 解析人物信息JSON失败:', parseError);
        console.log('原始响应内容:', response.content.substring(0, 500) + '...');
        return [];
      }

    } catch (error) {
      console.error('❌ 提取人物信息失败:', error);
      return [];
    }
  }

  /**
   * 从剧情脉络文档中提取剧情信息
   */
  async extractPlotsFromDocument(): Promise<ExtractedPlotInfo[]> {
    try {
      const plotDoc = await this.documentService.getDocument('plot-outline');
      if (!plotDoc || !plotDoc.content) {
        console.warn('剧情脉络文档不存在或为空');
        return [];
      }

      const cacheKey = `plots_${plotDoc.lastModified.getTime()}`;
      if (this.analysisCache.has(cacheKey)) {
        return this.analysisCache.get(cacheKey);
      }

      console.log('🤖 开始分析剧情脉络文档...');

      const prompt = `
请分析以下《龙渊谷变》剧情脉络文档，提取所有主线剧情信息并以JSON格式返回。

文档内容：
${plotDoc.content}

请按以下格式返回JSON数组，每条主线包含：
{
  "name": "主线名称",
  "description": "主线描述",
  "currentChapter": 当前章节数字,
  "progress": 进度百分比0-100,
  "status": "active|pending|completed|paused",
  "keyEvents": ["已发生的关键事件1", "已发生的关键事件2"],
  "nextPlannedEvents": ["计划中的事件1", "计划中的事件2"],
  "relatedCharacters": ["相关人物1", "相关人物2"]
}

只返回JSON数组，不要其他文字。
`;

      const response = await this.llmService.sendRequest('gemini', [
        { role: 'user', content: prompt }
      ]);

      try {
        // 清理响应内容，移除markdown标记
        let cleanContent = response.content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const plots = JSON.parse(cleanContent);
        this.analysisCache.set(cacheKey, plots);
        console.log(`✅ 成功提取 ${plots.length} 条主线剧情`);
        return plots;
      } catch (parseError) {
        console.error('❌ 解析剧情信息JSON失败:', parseError);
        console.log('原始响应内容:', response.content.substring(0, 500) + '...');
        return [];
      }

    } catch (error) {
      console.error('❌ 提取剧情信息失败:', error);
      return [];
    }
  }

  /**
   * 分析作者意愿控制台，获取当前写作指导
   */
  async analyzeAuthorControl(): Promise<{
    currentFocus: string;
    writingGuidelines: string[];
    restrictions: string[];
    nextChapterGuidance: string;
  }> {
    try {
      const controlDoc = await this.documentService.getDocument('author-control');
      if (!controlDoc || !controlDoc.content) {
        return {
          currentFocus: '无指导信息',
          writingGuidelines: [],
          restrictions: [],
          nextChapterGuidance: '请参考文档设定'
        };
      }

      const cacheKey = `control_${controlDoc.lastModified.getTime()}`;
      if (this.analysisCache.has(cacheKey)) {
        return this.analysisCache.get(cacheKey);
      }

      console.log('🤖 开始分析作者意愿控制台...');

      const prompt = `
请分析以下作者意愿控制台文档，提取当前的写作指导信息：

文档内容：
${controlDoc.content}

请以JSON格式返回：
{
  "currentFocus": "当前写作重点",
  "writingGuidelines": ["写作指导1", "写作指导2"],
  "restrictions": ["限制条件1", "限制条件2"],
  "nextChapterGuidance": "下一章节的具体指导"
}

只返回JSON，不要其他文字。
`;

      const response = await this.llmService.sendRequest('gemini', [
        { role: 'user', content: prompt }
      ]);

      try {
        // 清理响应内容，移除markdown标记
        let cleanContent = response.content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const analysis = JSON.parse(cleanContent);
        this.analysisCache.set(cacheKey, analysis);
        console.log('✅ 成功分析作者意愿控制台');
        return analysis;
      } catch (parseError) {
        console.error('❌ 解析作者控制信息JSON失败:', parseError);
        console.log('原始响应内容:', response.content.substring(0, 500) + '...');
        return {
          currentFocus: '解析失败',
          writingGuidelines: [],
          restrictions: [],
          nextChapterGuidance: '请手动检查文档'
        };
      }

    } catch (error) {
      console.error('❌ 分析作者意愿控制台失败:', error);
      return {
        currentFocus: '分析失败',
        writingGuidelines: [],
        restrictions: [],
        nextChapterGuidance: '请检查服务状态'
      };
    }
  }

  /**
   * 获取Agent执行指导
   */
  async getAgentGuidance(): Promise<{
    executionRules: string[];
    qualityStandards: string[];
    workflowSteps: string[];
  }> {
    try {
      const agentDoc = await this.documentService.getDocument('agent-manual');
      if (!agentDoc || !agentDoc.content) {
        return {
          executionRules: [],
          qualityStandards: [],
          workflowSteps: []
        };
      }

      const cacheKey = `agent_${agentDoc.lastModified.getTime()}`;
      if (this.analysisCache.has(cacheKey)) {
        return this.analysisCache.get(cacheKey);
      }

      console.log('🤖 开始分析Agent执行手册...');

      const prompt = `
请分析以下Agent执行手册，提取执行规则和工作流程：

文档内容：
${agentDoc.content}

请以JSON格式返回：
{
  "executionRules": ["执行规则1", "执行规则2"],
  "qualityStandards": ["质量标准1", "质量标准2"],
  "workflowSteps": ["工作流程1", "工作流程2"]
}

只返回JSON，不要其他文字。
`;

      const response = await this.llmService.sendRequest('gemini', [
        { role: 'user', content: prompt }
      ]);

      try {
        const guidance = JSON.parse(response.content);
        this.analysisCache.set(cacheKey, guidance);
        console.log('✅ 成功分析Agent执行手册');
        return guidance;
      } catch (parseError) {
        console.error('❌ 解析Agent指导JSON失败:', parseError);
        return {
          executionRules: [],
          qualityStandards: [],
          workflowSteps: []
        };
      }

    } catch (error) {
      console.error('❌ 分析Agent执行手册失败:', error);
      return {
        executionRules: [],
        qualityStandards: [],
        workflowSteps: []
      };
    }
  }

  /**
   * 清除分析缓存
   */
  clearCache(): void {
    this.analysisCache.clear();
    console.log('🗑️ 文档分析缓存已清除');
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: this.analysisCache.size,
      keys: Array.from(this.analysisCache.keys())
    };
  }
}
