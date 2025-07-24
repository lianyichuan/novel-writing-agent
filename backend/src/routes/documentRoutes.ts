import express from 'express';
import { DocumentController } from '../controllers/DocumentController';

const router = express.Router();
const documentController = new DocumentController();

// 获取所有文档列表
router.get('/', documentController.getAllDocuments);

// 获取特定文档内容
router.get('/:id', documentController.getDocument);

// 更新文档内容
router.put('/:id', documentController.updateDocument);

// 创建新文档
router.post('/', documentController.createDocument);

// 删除文档
router.delete('/:id', documentController.deleteDocument);

// 备份文档
router.post('/:id/backup', documentController.backupDocument);

// 获取文档历史版本
router.get('/:id/history', documentController.getDocumentHistory);

export default router;
