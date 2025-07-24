import React from 'react';
import { Card, Row, Col, Tag, Avatar } from 'antd';
import { UserOutlined, HeartOutlined } from '@ant-design/icons';

const CharacterManager: React.FC = () => {
  const characters = [
    {
      name: '林逸',
      role: '主角',
      age: 18,
      level: '筑基初期',
      description: '修炼天才，性格坚韧不拔',
      relationships: ['苏雨：青梅竹马', '张师兄：亦师亦友']
    },
    {
      name: '苏雨',
      role: '女主',
      age: 17,
      level: '筑基中期',
      description: '温柔善良，修炼天赋极佳',
      relationships: ['林逸：青梅竹马', '苏家：嫡系传人']
    },
    {
      name: '张师兄',
      role: '配角',
      age: 25,
      level: '筑基后期',
      description: '宗门内门弟子，指导林逸修炼',
      relationships: ['林逸：师兄弟', '宗门：内门弟子']
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case '主角': return '#f50';
      case '女主': return '#ff85c0';
      case '配角': return '#87d068';
      default: return '#108ee9';
    }
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <h1><UserOutlined /> 人物管理</h1>
        <p>管理小说中的人物关系和设定</p>
      </div>

      <Row gutter={[16, 16]}>
        {characters.map((character, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <Card className="character-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Avatar size={64} icon={<UserOutlined />} />
                <div style={{ marginLeft: 16 }}>
                  <h3 style={{ margin: 0 }}>{character.name}</h3>
                  <Tag color={getRoleColor(character.role)}>{character.role}</Tag>
                </div>
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <strong>年龄：</strong>{character.age}岁
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>修为：</strong>
                <Tag color="blue">{character.level}</Tag>
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>描述：</strong>{character.description}
              </div>
              
              <div>
                <strong>关系：</strong>
                {character.relationships.map((rel, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    <HeartOutlined style={{ marginRight: 4 }} />
                    {rel}
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CharacterManager;
