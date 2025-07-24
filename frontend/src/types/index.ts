// 文档相关类型
export interface Document {
  id: string;
  name: string;
  type: 'author-control' | 'plot-outline' | 'character-relations' | 'agent-manual' | 'chapter';
  content: string;
  filePath: string;
  lastModified: Date;
  createdAt: Date;
  version: number;
  hasChanges: boolean;
  metadata?: {
    wordCount?: number;
    chapterNumber?: number;
    tags?: string[];
    description?: string;
  };
}

// 剧情相关类型
export interface PlotLine {
  id: string;
  name: string;
  description?: string;
  type?: 'main' | 'sub' | 'character' | 'world';
  progress: number;
  status: 'active' | 'completed' | 'pending' | 'paused';
  priority?: 'high' | 'medium' | 'low';
  startChapter?: number;
  endChapter?: number;
  lastUpdate: Date;
  nodes?: PlotNode[];
}

export interface PlotNode {
  id: string;
  plotLineId: string;
  title: string;
  description: string;
  chapterNumber?: number;
  status: 'planned' | 'in-progress' | 'completed';
  dependencies?: string[];
  timestamp: Date;
}

export interface PlotStats {
  totalPlots: number;
  activePlots: number;
  completedPlots: number;
  averageProgress: number;
  recentUpdates?: PlotNode[];
}

// 人物相关类型
export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  level?: string;
  description: string;
  personality?: string[];
  appearance?: string;
  background?: string;
  relationships: Relationship[];
  firstAppearance?: number;
  lastAppearance?: number;
  importance?: number;
  status?: 'alive' | 'dead' | 'missing' | 'unknown';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Relationship {
  characterId: string;
  type: 'family' | 'friend' | 'enemy' | 'lover' | 'mentor' | 'student' | 'ally' | 'rival';
  description: string;
  strength: number;
  status?: 'current' | 'past' | 'developing';
}

export interface CharacterNetwork {
  nodes: {
    id: string;
    name: string;
    role: string;
    importance: number;
  }[];
  edges: {
    source: string;
    target: string;
    type: string;
    strength: number;
  }[];
}

// 写作相关类型
export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  summary: string;
  keyEvents: string[];
  characters: string[];
  plotLines: string[];
  wordCountTarget: number;
  estimatedDifficulty?: number;
  dependencies?: number[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  outline?: ChapterOutline;
  wordCount: number;
  status: 'draft' | 'review' | 'completed' | 'published';
  quality: QualityMetrics;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface QualityMetrics {
  overall: number;
  fluency: number;
  consistency: number;
  characterConsistency: number;
  creativity: number;
  pacing: number;
  feedback?: string;
}

export interface WritingStats {
  totalChapters: number;
  totalWords: number;
  todayWords: number;
  averageQuality: number;
  recentChapters: {
    number: number;
    title: string;
    wordCount: number;
    quality: number;
  }[];
  dailyProgress: {
    date: string;
    words: number;
    chapters: number;
  }[];
}

export interface WritingTask {
  id: string;
  type: 'outline' | 'chapter' | 'revision' | 'quality-check';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  chapterNumber?: number;
  requirements: string;
  result?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

// LLM相关类型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

// API响应类型
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}

// 应用状态类型
export interface AppState {
  loading: boolean;
  error: string | null;
  documents: Document[];
  plots: PlotLine[];
  characters: Character[];
  writingStats: WritingStats | null;
  currentDocument: Document | null;
}
