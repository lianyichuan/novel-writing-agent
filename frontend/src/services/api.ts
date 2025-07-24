import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 文档相关API
export const documentAPI = {
  // 获取所有文档
  getAllDocuments: () => api.get('/documents'),
  
  // 获取特定文档
  getDocument: (id: string) => api.get(`/documents/${id}`),
  
  // 更新文档
  updateDocument: (id: string, content: string) => 
    api.put(`/documents/${id}`, { content }),
  
  // 创建文档
  createDocument: (name: string, type: string, content: string = '') =>
    api.post('/documents', { name, type, content }),
  
  // 删除文档
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
  
  // 备份文档
  backupDocument: (id: string) => api.post(`/documents/${id}/backup`),
  
  // 获取文档历史
  getDocumentHistory: (id: string) => api.get(`/documents/${id}/history`),
};

// 剧情相关API
export const plotAPI = {
  // 获取所有剧情线
  getAllPlots: () => api.get('/plots'),
  
  // 获取特定剧情线
  getPlot: (id: string) => api.get(`/plots/${id}`),
  
  // 更新剧情进度
  updatePlotProgress: (id: string, progress: number) =>
    api.put(`/plots/${id}/progress`, { progress }),
  
  // 添加剧情节点
  addPlotNode: (id: string, nodeData: any) =>
    api.post(`/plots/${id}/nodes`, nodeData),
  
  // 获取剧情统计
  getPlotStats: () => api.get('/plots/stats/overview'),
};

// 人物相关API
export const characterAPI = {
  // 获取所有人物
  getAllCharacters: () => api.get('/characters'),
  
  // 获取特定人物
  getCharacter: (id: string) => api.get(`/characters/${id}`),
  
  // 更新人物信息
  updateCharacter: (id: string, data: any) =>
    api.put(`/characters/${id}`, data),
  
  // 创建人物
  createCharacter: (data: any) => api.post('/characters', data),
  
  // 删除人物
  deleteCharacter: (id: string) => api.delete(`/characters/${id}`),
  
  // 获取人物关系网络
  getRelationshipNetwork: () => api.get('/characters/relationships/network'),
};

// 写作相关API
export const writingAPI = {
  // 生成章节大纲
  generateOutline: (chapterNumber: number, requirements: string) =>
    api.post('/writing/outline', { chapterNumber, requirements }),
  
  // 生成章节内容
  generateChapter: (outline: any, requirements: string) =>
    api.post('/writing/chapter', { outline, requirements }),
  
  // 质量检查
  qualityCheck: (content: string) =>
    api.post('/writing/quality-check', { content }),
  
  // 获取写作统计
  getWritingStats: () => api.get('/writing/stats'),
  
  // 获取写作历史
  getWritingHistory: () => api.get('/writing/history'),
};

// LLM相关API
export const llmAPI = {
  // 测试连接
  testConnection: (provider?: string) =>
    api.get('/llm/test', { params: { provider } }),
  
  // 聊天
  chat: (messages: any[], provider?: string) =>
    api.post('/llm/chat', { messages, provider }),
  
  // 获取模型列表
  getModels: (provider?: string) =>
    api.get('/llm/models', { params: { provider } }),
  
  // 获取使用统计
  getUsage: () => api.get('/llm/usage'),
};

// 系统相关API
export const systemAPI = {
  // 健康检查
  health: () => api.get('/health'),
};

export default api;
