export interface PlotLine {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'sub' | 'character' | 'world';
  progress: number; // 0-100
  status: 'active' | 'completed' | 'pending' | 'paused';
  priority: 'high' | 'medium' | 'low';
  startChapter?: number;
  endChapter?: number;
  lastUpdate: Date;
  nodes: PlotNode[];
}

export interface PlotNode {
  id: string;
  plotLineId: string;
  title: string;
  description: string;
  chapterNumber?: number;
  status: 'planned' | 'in-progress' | 'completed';
  dependencies?: string[]; // 依赖的其他节点ID
  timestamp: Date;
}

export interface PlotStats {
  totalPlots: number;
  activePlots: number;
  completedPlots: number;
  averageProgress: number;
  recentUpdates: PlotNode[];
}
