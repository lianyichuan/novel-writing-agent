export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  level?: string; // 修炼等级
  description: string;
  personality: string[];
  appearance?: string;
  background?: string;
  relationships: Relationship[];
  firstAppearance?: number; // 首次出现章节
  lastAppearance?: number; // 最后出现章节
  importance: number; // 1-10 重要性评分
  status: 'alive' | 'dead' | 'missing' | 'unknown';
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  characterId: string;
  type: 'family' | 'friend' | 'enemy' | 'lover' | 'mentor' | 'student' | 'ally' | 'rival';
  description: string;
  strength: number; // 1-10 关系强度
  status: 'current' | 'past' | 'developing';
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
