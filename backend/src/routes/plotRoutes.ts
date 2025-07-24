import express from 'express';
import { PlotController } from '../controllers/PlotController';

const router = express.Router();
const plotController = new PlotController();

// 获取所有剧情线
router.get('/', plotController.getAllPlots);

// 获取特定剧情线详情
router.get('/:id', plotController.getPlot);

// 更新剧情线进度
router.put('/:id/progress', plotController.updatePlotProgress);

// 添加剧情节点
router.post('/:id/nodes', plotController.addPlotNode);

// 获取剧情统计数据
router.get('/stats/overview', plotController.getPlotStats);

export default router;
