import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import { Document, DocumentHistory, DocumentBackup } from '../models/Document';

export class DocumentService {
  private documentsPath: string;
  private backupPath: string;
  private watcher?: chokidar.FSWatcher;

  constructor() {
    this.documentsPath = path.join(__dirname, '../../../documents');
    this.backupPath = path.join(__dirname, '../../../backups');
    this.ensureDirectories();
    this.initializeWatcher();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.ensureDir(this.documentsPath);
    await fs.ensureDir(this.backupPath);
    await fs.ensureDir(path.join(this.documentsPath, 'chapters'));
  }

  private initializeWatcher(): void {
    this.watcher = chokidar.watch(this.documentsPath, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true
    });

    this.watcher.on('change', (filePath) => {
      console.log(`文档已更改: ${filePath}`);
      // 这里可以添加自动备份逻辑
    });
  }

  async getAllDocuments(): Promise<Document[]> {
    const documents: Document[] = [];
    
    // 预定义的核心文档
    const coreDocuments = [
      { id: 'author-control', name: '作者意愿控制台.txt', type: 'author-control' as const },
      { id: 'plot-outline', name: '主线剧情脉络.txt', type: 'plot-outline' as const },
      { id: 'character-relations', name: '原始人物关系.txt', type: 'character-relations' as const },
      { id: 'agent-manual', name: 'Agent执行手册.txt', type: 'agent-manual' as const }
    ];

    for (const docInfo of coreDocuments) {
      const filePath = path.join(this.documentsPath, docInfo.name);
      try {
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        documents.push({
          id: docInfo.id,
          name: docInfo.name,
          type: docInfo.type,
          content,
          filePath,
          lastModified: stats.mtime,
          createdAt: stats.birthtime,
          version: 1,
          hasChanges: false,
          metadata: {
            wordCount: content.length,
            description: `${docInfo.name}的内容`
          }
        });
      } catch (error) {
        console.warn(`无法读取文档 ${docInfo.name}:`, error);
        // 创建空文档
        documents.push({
          id: docInfo.id,
          name: docInfo.name,
          type: docInfo.type,
          content: '',
          filePath,
          lastModified: new Date(),
          createdAt: new Date(),
          version: 1,
          hasChanges: false
        });
      }
    }

    return documents;
  }

  async getDocument(id: string): Promise<Document | null> {
    const documents = await this.getAllDocuments();
    return documents.find(doc => doc.id === id) || null;
  }

  async updateDocument(id: string, content: string): Promise<Document> {
    const document = await this.getDocument(id);
    if (!document) {
      throw new Error(`文档 ${id} 不存在`);
    }

    // 备份当前版本
    await this.createBackup(document);

    // 更新文件
    await fs.writeFile(document.filePath, content, 'utf-8');

    // 更新文档信息
    const updatedDocument: Document = {
      ...document,
      content,
      lastModified: new Date(),
      version: document.version + 1,
      hasChanges: false,
      metadata: {
        ...document.metadata,
        wordCount: content.length
      }
    };

    return updatedDocument;
  }

  async createDocument(name: string, type: Document['type'], content: string = ''): Promise<Document> {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filePath = path.join(this.documentsPath, name);

    // 检查文件是否已存在
    if (await fs.pathExists(filePath)) {
      throw new Error(`文档 ${name} 已存在`);
    }

    await fs.writeFile(filePath, content, 'utf-8');

    const document: Document = {
      id,
      name,
      type,
      content,
      filePath,
      lastModified: new Date(),
      createdAt: new Date(),
      version: 1,
      hasChanges: false,
      metadata: {
        wordCount: content.length
      }
    };

    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.getDocument(id);
    if (!document) {
      throw new Error(`文档 ${id} 不存在`);
    }

    // 创建最终备份
    await this.createBackup(document);

    // 删除文件
    await fs.remove(document.filePath);
  }

  private async createBackup(document: Document): Promise<DocumentBackup> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${document.id}_${timestamp}.txt`;
    const backupFilePath = path.join(this.backupPath, backupFileName);

    await fs.writeFile(backupFilePath, document.content, 'utf-8');

    const backup: DocumentBackup = {
      id: `${document.id}_${timestamp}`,
      documentId: document.id,
      backupPath: backupFilePath,
      timestamp: new Date(),
      size: document.content.length
    };

    return backup;
  }

  async getDocumentHistory(id: string): Promise<DocumentHistory[]> {
    // 这里应该从备份文件中读取历史版本
    // 简化实现，返回空数组
    return [];
  }

  destroy(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
