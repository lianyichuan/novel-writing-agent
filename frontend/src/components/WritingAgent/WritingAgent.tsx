import React, { useState } from 'react';
import { Card, Button, Progress, Timeline, Input, Select, Row, Col, message, Modal, Form } from 'antd';
import { RobotOutlined, PlayCircleOutlined, PauseCircleOutlined, SettingOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useApp } from '../../store/AppContext';
import { writingAPI, llmAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const WritingAgent: React.FC = () => {
  const { state } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [showContentModal, setShowContentModal] = useState(false);
  const [form] = Form.useForm();

  const handleGenerateOutline = async () => {
    try {
      setIsRunning(true);
      setCurrentTask('生成章节大纲...');
      setProgress(20);

      const values = await form.validateFields();
      const response = await writingAPI.generateOutline(
        values.chapterNumber,
        values.requirements || '按照既定剧情发展'
      );

      setProgress(50);
      setCurrentTask('大纲生成完成');

      if (response.data.success) {
        const outline = response.data.data;
        setGeneratedContent(`# ${outline.title}\n\n## 章节概要\n${outline.summary}\n\n## 关键事件\n${outline.keyEvents.map((event: string, index: number) => `${index + 1}. ${event}`).join('\n')}\n\n## 涉及人物\n${outline.characters.join('、')}\n\n## 目标字数\n${outline.wordCountTarget}字`);
        setShowContentModal(true);
        message.success('章节大纲生成成功！');
      }
    } catch (error) {
      message.error('生成大纲失败');
      console.error(error);
    } finally {
      setIsRunning(false);
      setProgress(0);
      setCurrentTask('');
    }
  };

  const handleGenerateChapter = async () => {
    try {
      setIsRunning(true);
      setCurrentTask('生成章节内容...');
      setProgress(30);

      const values = await form.validateFields();

      // 先生成大纲
      const outlineResponse = await writingAPI.generateOutline(
        values.chapterNumber,
        values.requirements || '按照既定剧情发展'
      );

      setProgress(60);
      setCurrentTask('正在写作章节...');

      if (outlineResponse.data.success) {
        const chapterResponse = await writingAPI.generateChapter(
          outlineResponse.data.data,
          values.requirements || '保持人物性格一致，注意剧情连贯性'
        );

        setProgress(90);

        if (chapterResponse.data.success) {
          const chapter = chapterResponse.data.data;
          setGeneratedContent(chapter.content);
          setShowContentModal(true);
          message.success('章节内容生成成功！');
        }
      }
    } catch (error) {
      message.error('生成章节失败');
      console.error(error);
    } finally {
      setIsRunning(false);
      setProgress(0);
      setCurrentTask('');
    }
  };

  const handleQualityCheck = async () => {
    try {
      if (!generatedContent) {
        message.warning('请先生成内容再进行质量检查');
        return;
      }

      setIsRunning(true);
      setCurrentTask('质量检查中...');
      setProgress(50);

      const response = await writingAPI.qualityCheck(generatedContent);

      if (response.data.success) {
        const result = response.data.data;
        Modal.info({
          title: '质量检查结果',
          width: 600,
          content: (
            <div>
              <p><strong>总体评分：</strong>{result.score}/10</p>
              <p><strong>详细评分：</strong></p>
              <ul>
                <li>文字流畅度：{result.metrics.fluency}/10</li>
                <li>剧情连贯性：{result.metrics.consistency}/10</li>
                <li>创新度：{result.metrics.creativity}/10</li>
              </ul>
              <p><strong>反馈建议：</strong></p>
              <p>{result.feedback}</p>
            </div>
          ),
        });
        message.success('质量检查完成');
      }
    } catch (error) {
      message.error('质量检查失败');
      console.error(error);
    } finally {
      setIsRunning(false);
      setProgress(0);
      setCurrentTask('');
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setProgress(0);
    setCurrentTask('');
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <h1><RobotOutlined /> 写作Agent</h1>
        <p>AI自动写作助手控制面板</p>
      </div>

      <div className={`writing-status ${isRunning ? '' : 'warning'}`}>
        <RobotOutlined />
        <span>Agent状态: {isRunning ? currentTask || '正在工作中...' : '待机中'}</span>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="写作控制" className="chart-container">
            <Form form={form} layout="vertical" initialValues={{ chapterNumber: 157, wordCount: 2500 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="目标章节" name="chapterNumber">
                    <Select>
                      <Option value={157}>第157章</Option>
                      <Option value={158}>第158章</Option>
                      <Option value={159}>第159章</Option>
                      <Option value={160}>第160章</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="字数要求" name="wordCount">
                    <Select>
                      <Option value={2000}>2000字</Option>
                      <Option value={2500}>2500字</Option>
                      <Option value={3000}>3000字</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="特殊要求" name="requirements">
                <TextArea
                  rows={3}
                  placeholder="请输入对本章的特殊要求或指示..."
                  defaultValue="请注意保持人物性格的一致性，确保修炼等级的合理性。"
                />
              </Form.Item>
            </Form>

            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={handleGenerateOutline}
                disabled={isRunning}
                style={{ marginRight: 8 }}
              >
                生成大纲
              </Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleGenerateChapter}
                disabled={isRunning}
                style={{ marginRight: 8 }}
              >
                生成章节
              </Button>
              <Button
                icon={<CheckCircleOutlined />}
                onClick={handleQualityCheck}
                disabled={isRunning || !generatedContent}
                style={{ marginRight: 8 }}
              >
                质量检查
              </Button>
              <Button
                icon={<PauseCircleOutlined />}
                onClick={handleStop}
                disabled={!isRunning}
              >
                停止
              </Button>
            </div>

            {isRunning && (
              <div>
                <div style={{ marginBottom: 8 }}>进度: {currentTask}</div>
                <Progress percent={progress} status="active" />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="执行日志" className="chart-container">
            <Timeline>
              <Timeline.Item color="green">
                <div>完成第156章写作</div>
                <div style={{ fontSize: '12px', color: '#666' }}>2小时前</div>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <div>生成第157章大纲</div>
                <div style={{ fontSize: '12px', color: '#666' }}>3小时前</div>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <div>检测到剧情不一致，已修正</div>
                <div style={{ fontSize: '12px', color: '#666' }}>5小时前</div>
              </Timeline.Item>
              <Timeline.Item>
                <div>更新人物关系数据</div>
                <div style={{ fontSize: '12px', color: '#666' }}>1天前</div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Card title="系统状态" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {state.writingStats?.totalChapters || 0}
              </div>
              <div style={{ color: '#666' }}>总章节数</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {state.writingStats?.todayWords || 0}
              </div>
              <div style={{ color: '#666' }}>今日字数</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {state.writingStats?.averageQuality || 0}
              </div>
              <div style={{ color: '#666' }}>平均质量</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 内容显示模态框 */}
      <Modal
        title="生成的内容"
        open={showContentModal}
        onCancel={() => setShowContentModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowContentModal(false)}>
            关闭
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={() => {
              navigator.clipboard.writeText(generatedContent);
              message.success('内容已复制到剪贴板');
            }}
          >
            复制内容
          </Button>
        ]}
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {generatedContent}
          </pre>
        </div>
      </Modal>
    </div>
  );
};

export default WritingAgent;
