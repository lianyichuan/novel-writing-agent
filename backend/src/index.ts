import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import HealthChecker from './utils/healthCheck';
import { logInfo, logError } from './utils/logger';

// 导入路由
import documentRoutes from './routes/documentRoutes';
import plotRoutes from './routes/plotRoutes';
import characterRoutes from './routes/characterRoutes';
import writingRoutes from './routes/writingRoutes';
import llmRoutes from './routes/llmRoutes';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/documents', express.static(path.join(__dirname, '../../documents')));

// API路由
app.use('/api/documents', documentRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/llm', llmRoutes);

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const healthChecker = new HealthChecker();
    const health = await healthChecker.checkSystemHealth();

    const statusCode = health.overall === 'healthy' ? 200 :
                      health.overall === 'warning' ? 200 : 503;

    res.status(statusCode).json({
      status: health.overall,
      timestamp: health.timestamp,
      version: '1.0.0',
      components: health.components
    });
  } catch (error) {
    logError('健康检查失败', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      error: '健康检查失败'
    });
  }
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// 启动服务器
app.listen(PORT, () => {
  logInfo(`🚀 Server is running on port ${PORT}`);
  logInfo(`📚 Novel Writing Agent Backend Started`);
  logInfo(`🌐 API available at http://localhost:${PORT}/api`);

  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 Novel Writing Agent Backend Started`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
});

export default app;
