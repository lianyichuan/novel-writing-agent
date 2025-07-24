export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  summary: string;
  keyEvents: string[];
  characters: string[];
  plotLines: string[];
  wordCountTarget: number;
  estimatedDifficulty: number; // 1-10
  dependencies?: number[]; // 依赖的章节
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
  overall: number; // 0-10 总体质量
  fluency: number; // 文字流畅度
  consistency: number; // 剧情连贯性
  characterConsistency: number; // 人物一致性
  creativity: number; // 创新度
  pacing: number; // 节奏感
  feedback?: string; // AI反馈
}

export interface WritingStats {
  totalChapters: number;
  totalWords: number;
  todayWords: number;
  averageQuality: number;
  recentChapters: Chapter[];
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
