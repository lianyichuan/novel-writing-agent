import React from 'react';
import { Card, Timeline, Progress, Row, Col } from 'antd';
import { NodeIndexOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const PlotTracker: React.FC = () => {
  const plotLines = [
    { name: '主角成长线', progress: 65, status: 'active' },
    { name: '势力争斗线', progress: 45, status: 'active' },
    { name: '情感发展线', progress: 30, status: 'pending' },
    { name: '世界观构建线', progress: 80, status: 'active' }
  ];

  return (
    <div className="content-container">
      <div className="page-header">
        <h1><NodeIndexOutlined /> 剧情追踪</h1>
        <p>监控各条主线剧情的发展进度</p>
      </div>

      <Row gutter={[16, 16]}>
        {plotLines.map((plot, index) => (
          <Col xs={24} md={12} key={index}>
            <Card title={plot.name} className="plot-timeline">
              <Progress 
                percent={plot.progress} 
                status={plot.status === 'active' ? 'active' : 'normal'}
              />
              <p style={{ marginTop: 16, color: '#666' }}>
                当前状态: {plot.status === 'active' ? '进行中' : '待开始'}
              </p>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="剧情时间线" style={{ marginTop: 16 }}>
        <Timeline>
          <Timeline.Item dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
            <div>第1-50章：主角觉醒，进入宗门</div>
            <div style={{ color: '#666', fontSize: '12px' }}>已完成</div>
          </Timeline.Item>
          <Timeline.Item dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
            <div>第51-100章：宗门生活，实力提升</div>
            <div style={{ color: '#666', fontSize: '12px' }}>已完成</div>
          </Timeline.Item>
          <Timeline.Item dot={<ClockCircleOutlined style={{ color: '#1890ff' }} />}>
            <div>第101-150章：宗门大比，崭露头角</div>
            <div style={{ color: '#666', fontSize: '12px' }}>进行中</div>
          </Timeline.Item>
          <Timeline.Item>
            <div>第151-200章：秘境探索，机缘获得</div>
            <div style={{ color: '#666', fontSize: '12px' }}>计划中</div>
          </Timeline.Item>
        </Timeline>
      </Card>
    </div>
  );
};

export default PlotTracker;
