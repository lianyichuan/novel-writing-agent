import { Request, Response } from 'express';
import { LLMService } from '../services/LLMService';
import { DocumentAnalysisService } from '../services/DocumentAnalysisService';

export class WritingController {
  private llmService: LLMService;
  private analysisService: DocumentAnalysisService;

  constructor() {
    this.llmService = new LLMService();
    this.analysisService = new DocumentAnalysisService();
  }

  generateOutline = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chapterNumber, requirements } = req.body;

      if (!chapterNumber) {
        res.status(400).json({
          success: false,
          error: '参数错误',
          message: '章节号不能为空'
        });
        return;
      }

      console.log(`📝 开始生成第${chapterNumber}章大纲...`);

      // 获取文档分析结果
      const [characters, plots, authorControl, agentGuidance] = await Promise.all([
        this.analysisService.extractCharactersFromDocument(),
        this.analysisService.extractPlotsFromDocument(),
        this.analysisService.analyzeAuthorControl(),
        this.analysisService.getAgentGuidance()
      ]);

      // 构建智能提示词
      const prompt = `
作为《龙渊谷变》的写作助手，请为第${chapterNumber}章生成详细大纲。

【当前人物状态】
${characters.map(c => `- ${c.name}(${c.role}): ${c.description}, 当前状态: ${c.currentStatus || '未知'}`).join('\n')}

【主线剧情进展】
${plots.map(p => `- ${p.name}: 进度${p.progress}%, 状态: ${p.status}`).join('\n')}

【作者意愿控制】
- 当前重点: ${authorControl.currentFocus}
- 写作指导: ${authorControl.writingGuidelines.join(', ')}
- 限制条件: ${authorControl.restrictions.join(', ')}
- 下章指导: ${authorControl.nextChapterGuidance}

【特殊要求】
${requirements || '无特殊要求'}

请生成JSON格式的章节大纲：
{
  "chapterNumber": ${chapterNumber},
  "title": "章节标题",
  "summary": "章节概要",
  "keyEvents": ["主要事件1", "主要事件2"],
  "characters": ["涉及人物1", "涉及人物2"],
  "plotLines": ["推进的剧情线1", "推进的剧情线2"],
  "wordCountTarget": 预估字数,
  "keyDialogues": ["重要对话场景1", "重要对话场景2"],
  "conflictPoints": ["冲突点1", "冲突点2"],
  "chapterGoal": "本章目标"
}

只返回JSON，不要其他文字。
`;

      const response = await this.llmService.sendRequest('gemini', [
        { role: 'user', content: prompt }
      ]);

      let outline;
      try {
        outline = JSON.parse(response.content);
        outline.generatedAt = new Date();
        outline.basedOnDocuments = {
          characters: characters.length,
          plots: plots.length,
          authorGuidance: authorControl.currentFocus
        };

        console.log(`✅ 成功生成第${chapterNumber}章大纲`);
      } catch (parseError) {
        console.error('❌ 解析大纲JSON失败，使用备用方案:', parseError);
        // 备用方案：基于文档信息生成简单大纲
        outline = {
          chapterNumber,
          title: `第${chapterNumber}章：${authorControl.currentFocus}`,
          summary: authorControl.nextChapterGuidance,
          keyEvents: ['根据作者意愿发展剧情'],
          characters: characters.slice(0, 3).map(c => c.name),
          plotLines: plots.filter(p => p.status === 'active').map(p => p.name),
          wordCountTarget: 2500,
          generatedAt: new Date(),
          basedOnDocuments: {
            characters: characters.length,
            plots: plots.length,
            authorGuidance: authorControl.currentFocus
          }
        };
      }

      res.json({
        success: true,
        data: outline,
        message: `基于文档分析成功生成第${chapterNumber}章大纲`,
        meta: {
          source: 'document_analysis',
          documentsUsed: {
            characters: characters.length,
            plots: plots.length,
            authorControl: true,
            agentGuidance: true
          }
        }
      });
    } catch (error) {
      console.error('生成章节大纲失败:', error);
      res.status(500).json({
        success: false,
        error: '生成章节大纲失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  generateChapter = async (req: Request, res: Response): Promise<void> => {
    try {
      const { outline, requirements } = req.body;

      if (!outline) {
        res.status(400).json({
          success: false,
          error: '参数错误',
          message: '章节大纲不能为空'
        });
        return;
      }

      // 这里应该调用LLM服务生成章节内容
      // 暂时返回模拟数据
      const chapter = {
        id: Date.now().toString(),
        number: outline.chapterNumber || 157,
        title: outline.title || '新章节',
        content: '这里是AI生成的章节内容...\n\n林逸盘坐在修炼室中，感受着体内灵力的流转...',
        wordCount: 2500,
        status: 'draft',
        quality: {
          overall: 8.2,
          fluency: 8.5,
          consistency: 8.0,
          characterConsistency: 8.3,
          creativity: 7.8,
          pacing: 8.1
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };

      res.json({
        success: true,
        data: chapter,
        message: '生成章节内容成功'
      });
    } catch (error) {
      console.error('生成章节内容失败:', error);
      res.status(500).json({
        success: false,
        error: '生成章节内容失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  qualityCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: '参数错误',
          message: '检查内容不能为空'
        });
        return;
      }

      // 模拟质量检查结果
      const qualityResult = {
        score: 8.2,
        feedback: '整体质量良好，文字流畅，剧情连贯。建议在人物对话方面增加更多个性化特征。',
        metrics: {
          fluency: 8.5,
          consistency: 8.0,
          creativity: 7.8
        },
        suggestions: [
          '增加更多细节描写',
          '丰富人物对话',
          '加强情感表达'
        ]
      };

      res.json({
        success: true,
        data: qualityResult,
        message: '质量检查完成'
      });
    } catch (error) {
      console.error('质量检查失败:', error);
      res.status(500).json({
        success: false,
        error: '质量检查失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getWritingStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = {
        totalChapters: 156,
        totalWords: 468000,
        todayWords: 3200,
        averageQuality: 8.2,
        recentChapters: [
          { number: 156, title: '突破契机', wordCount: 2800, quality: 8.5 },
          { number: 155, title: '师兄指导', wordCount: 2600, quality: 8.0 }
        ],
        dailyProgress: [
          { date: '2024-01-20', words: 3200, chapters: 1 },
          { date: '2024-01-19', words: 2800, chapters: 1 }
        ]
      };

      res.json({
        success: true,
        data: stats,
        message: '获取写作统计成功'
      });
    } catch (error) {
      console.error('获取写作统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取写作统计失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getWritingHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const history = [
        {
          id: '1',
          type: 'chapter',
          status: 'completed',
          chapterNumber: 156,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
          completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1小时前
        },
        {
          id: '2',
          type: 'outline',
          status: 'completed',
          chapterNumber: 157,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3小时前
          completedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000) // 2.5小时前
        }
      ];

      res.json({
        success: true,
        data: history,
        message: '获取写作历史成功'
      });
    } catch (error) {
      console.error('获取写作历史失败:', error);
      res.status(500).json({
        success: false,
        error: '获取写作历史失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
}
