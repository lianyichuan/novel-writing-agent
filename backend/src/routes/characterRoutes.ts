import express from 'express';
import { CharacterController } from '../controllers/CharacterController';

const router = express.Router();
const characterController = new CharacterController();

// 获取所有人物
router.get('/', characterController.getAllCharacters);

// 获取人物关系网络 (必须在 /:id 之前)
router.get('/relationships/network', characterController.getRelationshipNetwork);

// 获取特定人物详情
router.get('/:id', characterController.getCharacter);

// 更新人物信息
router.put('/:id', characterController.updateCharacter);

// 创建新人物
router.post('/', characterController.createCharacter);

// 删除人物
router.delete('/:id', characterController.deleteCharacter);

export default router;
