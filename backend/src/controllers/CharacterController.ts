import { Request, Response } from 'express';

export class CharacterController {
  getAllCharacters = async (req: Request, res: Response): Promise<void> => {
    try {
      const characters = [
        {
          id: '1',
          name: '林逸',
          role: 'protagonist',
          age: 18,
          level: '筑基初期',
          description: '修炼天才，性格坚韧不拔',
          relationships: [
            { characterId: '2', type: 'lover', description: '青梅竹马', strength: 9 }
          ]
        },
        {
          id: '2',
          name: '苏雨',
          role: 'supporting',
          age: 17,
          level: '筑基中期',
          description: '温柔善良，修炼天赋极佳',
          relationships: [
            { characterId: '1', type: 'lover', description: '青梅竹马', strength: 9 }
          ]
        }
      ];

      res.json({
        success: true,
        data: characters,
        message: '获取人物列表成功'
      });
    } catch (error) {
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
      const network = {
        nodes: [
          { id: '1', name: '林逸', role: 'protagonist', importance: 10 },
          { id: '2', name: '苏雨', role: 'supporting', importance: 8 }
        ],
        edges: [
          { source: '1', target: '2', type: 'lover', strength: 9 }
        ]
      };

      res.json({
        success: true,
        data: network,
        message: '获取人物关系网络成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取人物关系网络失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
}
