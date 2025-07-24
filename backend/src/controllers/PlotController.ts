import { Request, Response } from 'express';
import { DocumentAnalysisService } from '../services/DocumentAnalysisService';

export class PlotController {
  private analysisService: DocumentAnalysisService;

  constructor() {
    this.analysisService = new DocumentAnalysisService();
  }

  getAllPlots = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📖 从文档中提取剧情信息...');

      // 从文档中实时提取剧情信息
      const extractedPlots = await this.analysisService.extractPlotsFromDocument();

      // 转换为前端需要的格式
      const plots = extractedPlots.map((plot, index) => ({
        id: (index + 1).toString(),
        name: plot.name,
        description: plot.description,
        progress: plot.progress,
        status: plot.status,
        currentChapter: plot.currentChapter,
        keyEvents: plot.keyEvents,
        nextPlannedEvents: plot.nextPlannedEvents,
        relatedCharacters: plot.relatedCharacters,
        lastUpdate: new Date()
      }));

      console.log(`✅ 成功提取 ${plots.length} 条主线剧情`);

      res.json({
        success: true,
        data: plots,
        message: `从文档中成功提取 ${plots.length} 条主线剧情`,
        meta: {
          source: 'document_analysis',
          extractedAt: new Date(),
          totalPlots: plots.length
        }
      });
    } catch (error) {
      console.error('❌ 获取剧情列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取剧情列表失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getPlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // 模拟数据
      const plot = {
        id,
        name: '主角成长线',
        description: '描述主角从弱小到强大的成长历程',
        progress: 65,
        status: 'active',
        nodes: []
      };

      res.json({
        success: true,
        data: plot,
        message: '获取剧情详情成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取剧情详情失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  updatePlotProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { progress } = req.body;

      res.json({
        success: true,
        data: { id, progress },
        message: '更新剧情进度成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '更新剧情进度失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  addPlotNode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const nodeData = req.body;

      res.json({
        success: true,
        data: { plotId: id, node: nodeData },
        message: '添加剧情节点成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '添加剧情节点失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getPlotStats = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📊 计算剧情统计信息...');

      // 从文档中提取剧情信息
      const extractedPlots = await this.analysisService.extractPlotsFromDocument();

      // 计算统计信息
      const totalPlots = extractedPlots.length;
      const activePlots = extractedPlots.filter(p => p.status === 'active').length;
      const completedPlots = extractedPlots.filter(p => p.status === 'completed').length;
      const pendingPlots = extractedPlots.filter(p => p.status === 'pending').length;
      const pausedPlots = extractedPlots.filter(p => p.status === 'paused').length;

      const averageProgress = totalPlots > 0
        ? Math.round(extractedPlots.reduce((sum, p) => sum + p.progress, 0) / totalPlots)
        : 0;

      const stats = {
        totalPlots,
        activePlots,
        completedPlots,
        pendingPlots,
        pausedPlots,
        averageProgress,
        plotDetails: extractedPlots.map(p => ({
          name: p.name,
          progress: p.progress,
          status: p.status,
          currentChapter: p.currentChapter
        }))
      };

      console.log(`✅ 剧情统计: 总计${totalPlots}条, 活跃${activePlots}条, 平均进度${averageProgress}%`);

      res.json({
        success: true,
        data: stats,
        message: '获取剧情统计成功',
        meta: {
          source: 'document_analysis',
          calculatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ 获取剧情统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取剧情统计失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
}
