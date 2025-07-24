import fs from 'fs-extra';
import path from 'path';
import { LLMService } from '../services/LLMService';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error';
  components: {
    filesystem: HealthStatus;
    llm: HealthStatus;
    memory: HealthStatus;
    documents: HealthStatus;
  };
  timestamp: string;
}

export class HealthChecker {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  async checkSystemHealth(): Promise<SystemHealth> {
    const components = {
      filesystem: await this.checkFilesystem(),
      llm: await this.checkLLM(),
      memory: this.checkMemory(),
      documents: await this.checkDocuments(),
    };

    // 确定整体健康状态
    const hasError = Object.values(components).some(c => c.status === 'error');
    const hasWarning = Object.values(components).some(c => c.status === 'warning');
    
    let overall: 'healthy' | 'warning' | 'error' = 'healthy';
    if (hasError) overall = 'error';
    else if (hasWarning) overall = 'warning';

    return {
      overall,
      components,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkFilesystem(): Promise<HealthStatus> {
    try {
      const documentsPath = path.join(__dirname, '../../../documents');
      const backupPath = path.join(__dirname, '../../../backups');
      const logsPath = path.join(__dirname, '../../../logs');

      // 检查关键目录是否存在
      const dirs = [documentsPath, backupPath, logsPath];
      for (const dir of dirs) {
        await fs.ensureDir(dir);
      }

      // 检查磁盘空间
      const stats = await fs.stat(documentsPath);
      
      return {
        status: 'healthy',
        message: '文件系统正常',
        details: {
          documentsPath: await fs.pathExists(documentsPath),
          backupPath: await fs.pathExists(backupPath),
          logsPath: await fs.pathExists(logsPath),
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: '文件系统检查失败',
        details: error instanceof Error ? error.message : error
      };
    }
  }

  private async checkLLM(): Promise<HealthStatus> {
    try {
      const isConnected = await this.llmService.testConnection();
      
      if (isConnected) {
        return {
          status: 'healthy',
          message: 'LLM服务连接正常'
        };
      } else {
        return {
          status: 'warning',
          message: 'LLM服务连接失败，请检查API配置'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'LLM服务检查失败',
        details: error instanceof Error ? error.message : error
      };
    }
  }

  private checkMemory(): HealthStatus {
    const used = process.memoryUsage();
    const totalMB = Math.round(used.rss / 1024 / 1024);
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    let message = '内存使用正常';

    if (totalMB > 1000) {
      status = 'warning';
      message = '内存使用较高';
    }

    if (totalMB > 2000) {
      status = 'error';
      message = '内存使用过高';
    }

    return {
      status,
      message,
      details: {
        rss: `${totalMB}MB`,
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        external: `${Math.round(used.external / 1024 / 1024)}MB`
      }
    };
  }

  private async checkDocuments(): Promise<HealthStatus> {
    try {
      const documentsPath = path.join(__dirname, '../../../documents');
      const requiredFiles = [
        '作者意愿控制台.txt',
        '主线剧情脉络.txt',
        '原始人物关系.txt',
        'Agent执行手册.txt'
      ];

      const missingFiles = [];
      for (const file of requiredFiles) {
        const filePath = path.join(documentsPath, file);
        if (!(await fs.pathExists(filePath))) {
          missingFiles.push(file);
        }
      }

      if (missingFiles.length === 0) {
        return {
          status: 'healthy',
          message: '核心文档完整'
        };
      } else if (missingFiles.length < requiredFiles.length) {
        return {
          status: 'warning',
          message: '部分核心文档缺失',
          details: { missingFiles }
        };
      } else {
        return {
          status: 'error',
          message: '核心文档缺失',
          details: { missingFiles }
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: '文档检查失败',
        details: error instanceof Error ? error.message : error
      };
    }
  }
}

export default HealthChecker;
