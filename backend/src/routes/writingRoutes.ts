import express from 'express';
import { WritingController } from '../controllers/WritingController';

const router = express.Router();
const writingController = new WritingController();

// 生成章节大纲
router.post('/outline', writingController.generateOutline);

// 生成章节内容
router.post('/chapter', writingController.generateChapter);

// 质量检查
router.post('/quality-check', writingController.qualityCheck);

// 获取写作统计
router.get('/stats', writingController.getWritingStats);

// 获取写作历史
router.get('/history', writingController.getWritingHistory);

export default router;
