import { Request, Response } from 'express';
import { LLMService } from '../services/LLMService';

export class LLMController {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  testConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider } = req.query;
      const isConnected = await this.llmService.testConnection(provider as string);
      
      res.json({
        success: true,
        data: { connected: isConnected },
        message: isConnected ? 'LLM连接正常' : 'LLM连接失败'
      });
    } catch (error) {
      console.error('LLM连接测试失败:', error);
      res.status(500).json({
        success: false,
        error: 'LLM连接测试失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  chat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messages, provider } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({
          success: false,
          error: '参数错误',
          message: '消息列表不能为空'
        });
        return;
      }

      const response = await this.llmService.chat(messages, provider);
      
      res.json({
        success: true,
        data: response,
        message: '聊天请求成功'
      });
    } catch (error) {
      console.error('聊天请求失败:', error);
      res.status(500).json({
        success: false,
        error: '聊天请求失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getModels = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider } = req.query;
      const models = this.llmService.getModels(provider as string);
      
      res.json({
        success: true,
        data: models,
        message: '获取模型列表成功'
      });
    } catch (error) {
      console.error('获取模型列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取模型列表失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getUsage = async (req: Request, res: Response): Promise<void> => {
    try {
      const usage = this.llmService.getUsageStats();
      
      res.json({
        success: true,
        data: usage,
        message: '获取使用统计成功'
      });
    } catch (error) {
      console.error('获取使用统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取使用统计失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
}
