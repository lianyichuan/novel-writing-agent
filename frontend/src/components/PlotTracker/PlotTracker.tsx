import React, { useState, useEffect } from 'react';
import { Card, Timeline, Progress, Row, Col, Spin, message, Badge, Tag } from 'antd';
import { NodeIndexOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';

interface Plot {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'pending' | 'completed' | 'paused';
  currentChapter: number;
  keyEvents: string[];
  nextPlannedEvents: string[];
  relatedCharacters: string[];
  lastUpdate: string;
}

const PlotTracker: React.FC = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/plots');
      const data = await response.json();

      if (data.success) {
        setPlots(data.data);
        setLastUpdate(new Date().toLocaleString());
        message.success(`成功加载 ${data.data.length} 条主线剧情`);
      } else {
        message.error('加载剧情信息失败');
      }
    } catch (error) {
      console.error('获取剧情信息失败:', error);
      message.error('网络连接失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#52c41a';
      case 'pending': return '#faad14';
      case 'completed': return '#1890ff';
      case 'paused': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '进行中';
      case 'pending': return '待开始';
      case 'completed': return '已完成';
      case 'paused': return '暂停';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="content-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>正在从文档中提取剧情信息...</p>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="page-header">
        <h1><NodeIndexOutlined /> 剧情追踪</h1>
        <p>基于《龙渊谷变》文档的智能剧情监控系统</p>
        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          <Badge status="success" text={`数据来源：文档分析`} />
          <span style={{ marginLeft: 16 }}>最后更新：{lastUpdate}</span>
          <ReloadOutlined
            style={{ marginLeft: 16, cursor: 'pointer' }}
            onClick={fetchPlots}
            title="重新加载"
          />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {plots.map((plot) => (
          <Col xs={24} md={12} key={plot.id}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{plot.name}</span>
                  <Tag color={getStatusColor(plot.status)}>{getStatusText(plot.status)}</Tag>
                </div>
              }
              className="plot-timeline"
            >
              <Progress
                percent={plot.progress}
                status={plot.status === 'active' ? 'active' : 'normal'}
                format={(percent) => `${percent}%`}
              />
              <div style={{ marginTop: 12 }}>
                <p><strong>描述：</strong>{plot.description}</p>
                <p><strong>当前章节：</strong>第{plot.currentChapter}章</p>
                {plot.relatedCharacters.length > 0 && (
                  <p><strong>相关人物：</strong>{plot.relatedCharacters.join(', ')}</p>
                )}
                {plot.nextPlannedEvents.length > 0 && (
                  <div>
                    <strong>下一步计划：</strong>
                    <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                      {plot.nextPlannedEvents.map((event, idx) => (
                        <li key={idx} style={{ fontSize: '12px', color: '#666' }}>{event}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="剧情发展时间线" style={{ marginTop: 16 }}>
        <Timeline>
          {plots.map((plot, index) => (
            <Timeline.Item
              key={plot.id}
              dot={
                plot.status === 'active' ?
                  <ClockCircleOutlined style={{ color: '#1890ff' }} /> :
                  plot.status === 'completed' ?
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                    <ClockCircleOutlined style={{ color: '#d9d9d9' }} />
              }
            >
              <div>{plot.name}</div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                进度: {plot.progress}% | 当前章节: 第{plot.currentChapter}章 | 状态: {getStatusText(plot.status)}
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                {plot.description}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );
};

export default PlotTracker;
