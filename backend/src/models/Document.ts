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

export interface DocumentHistory {
  id: string;
  documentId: string;
  version: number;
  content: string;
  timestamp: Date;
  changes: string;
}

export interface DocumentBackup {
  id: string;
  documentId: string;
  backupPath: string;
  timestamp: Date;
  size: number;
}
