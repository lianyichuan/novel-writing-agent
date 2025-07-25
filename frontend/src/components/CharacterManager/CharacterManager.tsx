import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Avatar, Spin, message, Badge } from 'antd';
import { UserOutlined, HeartOutlined, ReloadOutlined } from '@ant-design/icons';

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  level?: string;
  age?: number;
  description: string;
  currentStatus: string;
  importance: number;
  relationships: Array<{
    characterId: string;
    type: string;
    strength: number;
  }>;
  lastUpdated: string;
}

const CharacterManager: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/characters');
      const data = await response.json();

      if (data.success) {
        setCharacters(data.data);
        setLastUpdate(new Date().toLocaleString());
        message.success(`成功加载 ${data.data.length} 个人物信息`);
      } else {
        message.error('加载人物信息失败');
      }
    } catch (error) {
      console.error('获取人物信息失败:', error);
      message.error('网络连接失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist': return '#f50';
      case 'antagonist': return '#ff4d4f';
      case 'supporting': return '#87d068';
      case 'minor': return '#108ee9';
      default: return '#108ee9';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'protagonist': return '主角';
      case 'antagonist': return '反派';
      case 'supporting': return '配角';
      case 'minor': return '次要';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="content-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>正在从文档中提取人物信息...</p>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="page-header">
        <h1><UserOutlined /> 人物管理</h1>
        <p>基于《龙渊谷变》文档的智能人物管理系统</p>
        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          <Badge status="success" text={`数据来源：文档分析`} />
          <span style={{ marginLeft: 16 }}>最后更新：{lastUpdate}</span>
          <ReloadOutlined
            style={{ marginLeft: 16, cursor: 'pointer' }}
            onClick={fetchCharacters}
            title="重新加载"
          />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {characters.map((character) => (
          <Col xs={24} md={12} lg={8} key={character.id}>
            <Card className="character-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Avatar size={64} icon={<UserOutlined />} />
                <div style={{ marginLeft: 16 }}>
                  <h3 style={{ margin: 0 }}>{character.name}</h3>
                  <Tag color={getRoleColor(character.role)}>{getRoleText(character.role)}</Tag>
                  <Badge
                    count={character.importance}
                    style={{ backgroundColor: '#52c41a', marginLeft: 8 }}
                    title="重要程度"
                  />
                </div>
              </div>

              {character.age && (
                <div style={{ marginBottom: 8 }}>
                  <strong>年龄：</strong>{character.age}岁
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <strong>修为：</strong>
                <Tag color="blue">{character.level}</Tag>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>状态：</strong>
                <Tag color="green">{character.currentStatus}</Tag>
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>描述：</strong>{character.description}
              </div>

              <div>
                <strong>关系：</strong>
                {character.relationships.map((rel, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    <HeartOutlined style={{ marginRight: 4 }} />
                    {rel.characterId}：{rel.type} (强度: {rel.strength})
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
