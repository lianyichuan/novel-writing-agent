import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Timeline, Alert, Spin } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  RobotOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useApp } from '../../store/AppContext';

interface PlotProgress {
  id: string;
  name: string;
  progress: number;
  status: 'active' | 'completed' | 'pending';
  lastUpdate: string;
}

interface SystemStats {
  totalChapters: number;
  totalWords: number;
  charactersCount: number;
  plotsCount: number;
  todayWords: number;
  avgQuality: number;
}

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalChapters: 0,
    totalWords: 0,
    charactersCount: 0,
    plotsCount: 4,
    todayWords: 0,
    avgQuality: 0
  });

  const [plotProgress, setPlotProgress] = useState<PlotProgress[]>([
    { id: '1', name: '主角成长线', progress: 65, status: 'active', lastUpdate: '2小时前' },
    { id: '2', name: '势力争斗线', progress: 45, status: 'active', lastUpdate: '1天前' },
    { id: '3', name: '情感发展线', progress: 30, status: 'pending', lastUpdate: '3天前' },
    { id: '4', name: '世界观构建线', progress: 80, status: 'active', lastUpdate: '5小时前' }
  ]);

  const [recentActivities] = useState([
    { time: '10:30', content: '完成第156章《突破契机》写作', type: 'success' },
    { time: '09:15', content: '更新人物关系：林逸与苏雨的关系发展', type: 'info' },
    { time: '08:45', content: '剧情检查：发现主角实力提升过快', type: 'warning' },
    { time: '昨天 22:30', content: '生成第157章大纲', type: 'success' },
    { time: '昨天 20:15', content: '备份所有文档', type: 'info' }
  ]);

  useEffect(() => {
    // 使用真实数据更新统计信息
    if (state.writingStats) {
      setSystemStats({
        totalChapters: state.writingStats.totalChapters,
        totalWords: state.writingStats.totalWords,
        charactersCount: state.characters.length,
        plotsCount: state.plots.length,
        todayWords: state.writingStats.todayWords,
        avgQuality: state.writingStats.averageQuality
      });
    }
  }, [state.writingStats, state.characters, state.plots]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 60) return '#1890ff';
    if (progress >= 40) return '#faad14';
    return '#f5222d';
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  if (state.loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#666' }}>正在加载数据...</p>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="page-header">
        <h1>📊 写作控制台</h1>
        <p>《龙渊谷变》创作进度总览</p>
      </div>

      {/* 系统状态警报 */}
      <Alert
        message="系统运行正常"
        description="所有服务正常运行，今日已完成3200字写作任务"
        type="success"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 核心统计数据 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card">
            <Statistic
              title="总章节数"
              value={systemStats.totalChapters}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              suffix="章"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card">
            <Statistic
              title="总字数"
              value={systemStats.totalWords}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              suffix="字"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card">
            <Statistic
              title="人物数量"
              value={systemStats.charactersCount}
              prefix={<UserOutlined style={{ color: '#faad14' }} />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card">
            <Statistic
              title="今日字数"
              value={systemStats.todayWords}
              prefix={<TrophyOutlined style={{ color: '#f5222d' }} />}
              suffix="字"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 剧情进度 */}
        <Col xs={24} lg={12}>
          <Card title="📈 主线剧情进度" className="chart-container">
            {plotProgress.map(plot => (
              <div key={plot.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{plot.name}</span>
                  <span style={{ color: '#666', fontSize: '12px' }}>{plot.lastUpdate}</span>
                </div>
                <Progress
                  percent={plot.progress}
                  strokeColor={getProgressColor(plot.progress)}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={12}>
          <Card title="🕐 最近活动" className="chart-container">
            <Timeline>
              {recentActivities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={getTimelineColor(activity.type)}
                  dot={<ClockCircleOutlined />}
                >
                  <div>
                    <div style={{ fontSize: '14px', marginBottom: 4 }}>
                      {activity.content}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {activity.time}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 写作质量和Agent状态 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="📝 写作质量" className="chart-container">
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={systemStats.avgQuality * 10}
                format={() => `${systemStats.avgQuality}/10`}
                strokeColor="#52c41a"
                size={120}
              />
              <p style={{ marginTop: 16, color: '#666' }}>
                平均质量评分
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="🤖 Agent状态" className="chart-container">
            <div style={{ textAlign: 'center' }}>
              <RobotOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                  运行正常
                </div>
                <div style={{ color: '#666', marginTop: 8 }}>
                  上次执行：2小时前
                </div>
                <div style={{ color: '#666' }}>
                  下次计划：1小时后
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
