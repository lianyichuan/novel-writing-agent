import express from 'express';
import { LLMController } from '../controllers/LLMController';

const router = express.Router();
const llmController = new LLMController();

// 测试LLM连接
router.get('/test', llmController.testConnection);

// 发送聊天请求
router.post('/chat', llmController.chat);

// 获取模型列表
router.get('/models', llmController.getModels);

// 获取使用统计
router.get('/usage', llmController.getUsage);

export default router;
