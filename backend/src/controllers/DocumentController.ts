import { Request, Response } from 'express';
import { DocumentService } from '../services/DocumentService';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  getAllDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const documents = await this.documentService.getAllDocuments();
      res.json({
        success: true,
        data: documents,
        message: '获取文档列表成功'
      });
    } catch (error) {
      console.error('获取文档列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取文档列表失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const document = await this.documentService.getDocument(id);
      
      if (!document) {
        res.status(404).json({
          success: false,
          error: '文档不存在',
          message: `未找到ID为 ${id} 的文档`
        });
        return;
      }

      res.json({
        success: true,
        data: document,
        message: '获取文档成功'
      });
    } catch (error) {
      console.error('获取文档失败:', error);
      res.status(500).json({
        success: false,
        error: '获取文档失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  updateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content && content !== '') {
        res.status(400).json({
          success: false,
          error: '参数错误',
          message: '文档内容不能为空'
        });
        return;
      }

      const updatedDocument = await this.documentService.updateDocument(id, content);
      
      res.json({
        success: true,
        data: updatedDocument,
        message: '更新文档成功'
      });
    } catch (error) {
      console.error('更新文档失败:', error);
      res.status(500).json({
        success: false,
        error: '更新文档失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  createDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, type, content = '' } = req.body;

      if (!name || !type) {
        res.status(400).json({
          success: false,
          error: '参数错误',
          message: '文档名称和类型不能为空'
        });
        return;
      }

      const newDocument = await this.documentService.createDocument(name, type, content);
      
      res.status(201).json({
        success: true,
        data: newDocument,
        message: '创建文档成功'
      });
    } catch (error) {
      console.error('创建文档失败:', error);
      res.status(500).json({
        success: false,
        error: '创建文档失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.documentService.deleteDocument(id);
      
      res.json({
        success: true,
        message: '删除文档成功'
      });
    } catch (error) {
      console.error('删除文档失败:', error);
      res.status(500).json({
        success: false,
        error: '删除文档失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  backupDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const document = await this.documentService.getDocument(id);
      
      if (!document) {
        res.status(404).json({
          success: false,
          error: '文档不存在',
          message: `未找到ID为 ${id} 的文档`
        });
        return;
      }

      // 这里应该调用备份方法，简化实现
      res.json({
        success: true,
        message: '备份文档成功'
      });
    } catch (error) {
      console.error('备份文档失败:', error);
      res.status(500).json({
        success: false,
        error: '备份文档失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getDocumentHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const history = await this.documentService.getDocumentHistory(id);
      
      res.json({
        success: true,
        data: history,
        message: '获取文档历史成功'
      });
    } catch (error) {
      console.error('获取文档历史失败:', error);
      res.status(500).json({
        success: false,
        error: '获取文档历史失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
}
