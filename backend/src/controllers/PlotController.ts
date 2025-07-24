import { Request, Response } from 'express';

export class PlotController {
  getAllPlots = async (req: Request, res: Response): Promise<void> => {
    try {
      // 模拟数据
      const plots = [
        { id: '1', name: '主角成长线', progress: 65, status: 'active', lastUpdate: new Date() },
        { id: '2', name: '势力争斗线', progress: 45, status: 'active', lastUpdate: new Date() },
        { id: '3', name: '情感发展线', progress: 30, status: 'pending', lastUpdate: new Date() },
        { id: '4', name: '世界观构建线', progress: 80, status: 'active', lastUpdate: new Date() }
      ];

      res.json({
        success: true,
        data: plots,
        message: '获取剧情列表成功'
      });
    } catch (error) {
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
      const stats = {
        totalPlots: 4,
        activePlots: 3,
        completedPlots: 0,
        averageProgress: 55
      };

      res.json({
        success: true,
        data: stats,
        message: '获取剧情统计成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取剧情统计失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
}
