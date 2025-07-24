import { Request, Response } from 'express';
import { DocumentAnalysisService } from '../services/DocumentAnalysisService';

export class CharacterController {
  private analysisService: DocumentAnalysisService;

  constructor() {
    this.analysisService = new DocumentAnalysisService();
  }

  getAllCharacters = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 从文档中提取人物信息...');

      // 从文档中实时提取人物信息
      const extractedCharacters = await this.analysisService.extractCharactersFromDocument();

      // 转换为前端需要的格式
      const characters = extractedCharacters.map((char, index) => ({
        id: (index + 1).toString(),
        name: char.name,
        role: char.role,
        age: char.age,
        level: char.level,
        description: char.description,
        currentStatus: char.currentStatus,
        importance: char.importance,
        relationships: char.relationships.map(rel => ({
          characterId: rel.target,
          type: rel.type,
          description: rel.description,
          strength: rel.strength
        })),
        lastUpdated: new Date()
      }));

      console.log(`✅ 成功提取 ${characters.length} 个人物信息`);

      res.json({
        success: true,
        data: characters,
        message: `从文档中成功提取 ${characters.length} 个人物信息`,
        meta: {
          source: 'document_analysis',
          extractedAt: new Date(),
          totalCharacters: characters.length
        }
      });
    } catch (error) {
      console.error('❌ 获取人物列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取人物列表失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const character = {
        id,
        name: '林逸',
        role: 'protagonist',
        age: 18,
        level: '筑基初期',
        description: '修炼天才，性格坚韧不拔'
      };

      res.json({
        success: true,
        data: character,
        message: '获取人物详情成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取人物详情失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  updateCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      res.json({
        success: true,
        data: { id, ...updateData },
        message: '更新人物信息成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '更新人物信息失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  createCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
      const characterData = req.body;
      const newCharacter = {
        id: Date.now().toString(),
        ...characterData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.status(201).json({
        success: true,
        data: newCharacter,
        message: '创建人物成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '创建人物失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  deleteCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      res.json({
        success: true,
        message: '删除人物成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '删除人物失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  getRelationshipNetwork = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🕸️ 构建人物关系网络...');

      // 从文档中提取人物信息
      const extractedCharacters = await this.analysisService.extractCharactersFromDocument();

      // 构建节点
      const nodes = extractedCharacters.map((char, index) => ({
        id: (index + 1).toString(),
        name: char.name,
        role: char.role,
        importance: char.importance,
        level: char.level,
        description: char.description
      }));

      // 构建边（关系）
      const edges: any[] = [];
      extractedCharacters.forEach((char, sourceIndex) => {
        char.relationships.forEach(rel => {
          const targetIndex = extractedCharacters.findIndex(c => c.name === rel.target);
          if (targetIndex !== -1) {
            edges.push({
              source: (sourceIndex + 1).toString(),
              target: (targetIndex + 1).toString(),
              type: rel.type,
              description: rel.description,
              strength: rel.strength
            });
          }
        });
      });

      const network = { nodes, edges };

      console.log(`✅ 成功构建关系网络: ${nodes.length} 个节点, ${edges.length} 条关系`);

      res.json({
        success: true,
        data: network,
        message: `成功构建人物关系网络: ${nodes.length} 个人物, ${edges.length} 条关系`,
        meta: {
          source: 'document_analysis',
          nodeCount: nodes.length,
          edgeCount: edges.length,
          extractedAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ 获取人物关系网络失败:', error);
      res.status(500).json({
        success: false,
        error: '获取人物关系网络失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
}
