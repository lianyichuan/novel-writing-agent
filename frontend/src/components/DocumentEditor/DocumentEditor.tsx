import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, message, Spin, Alert } from 'antd';
import { SaveOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import { useApp } from '../../store/AppContext';
import { Document } from '../../types';

const { TabPane } = Tabs;

const DocumentEditor: React.FC = () => {
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState<string>('author-control');
  const [saving, setSaving] = useState(false);
  const [localChanges, setLocalChanges] = useState<{ [key: string]: string }>({});

  // 设置默认活动标签
  useEffect(() => {
    if (state.documents.length > 0 && !activeTab) {
      setActiveTab(state.documents[0].id);
    }
  }, [state.documents, activeTab]);

  const handleContentChange = (value: string | undefined, documentId: string) => {
    if (value !== undefined) {
      setLocalChanges(prev => ({
        ...prev,
        [documentId]: value
      }));
    }
  };

  const handleSave = async (documentId: string) => {
    const content = localChanges[documentId];
    if (content === undefined) return;

    setSaving(true);
    try {
      await actions.updateDocument(documentId, content);
      // 清除本地更改
      setLocalChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[documentId];
        return newChanges;
      });
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async (documentId: string) => {
    try {
      // 清除本地更改，重新加载原始内容
      setLocalChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[documentId];
        return newChanges;
      });
      await actions.loadDocuments();
      message.success('重新加载成功');
    } catch (error) {
      message.error('重新加载失败');
    }
  };

  const getCurrentDocument = () => {
    return state.documents.find(doc => doc.id === activeTab);
  };

  const currentDoc = getCurrentDocument();
  const hasLocalChanges = currentDoc && localChanges[currentDoc.id] !== undefined;

  if (state.loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#666' }}>正在加载文档...</p>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="page-header">
        <h1>📝 文档管理</h1>
        <p>编辑和管理小说创作相关文档</p>
      </div>

      <Alert
        message="文档编辑提示"
        description="修改文档后请及时保存。系统会自动检测文档变化并提醒保存。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          className="document-tabs"
          tabBarExtraContent={
            currentDoc && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  disabled={!hasLocalChanges}
                  onClick={() => handleSave(activeTab)}
                >
                  保存
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => handleReload(activeTab)}
                >
                  重新加载
                </Button>
              </div>
            )
          }
        >
          {state.documents.map(doc => {
            const hasChanges = localChanges[doc.id] !== undefined;
            const displayContent = localChanges[doc.id] !== undefined
              ? localChanges[doc.id]
              : doc.content;

            return (
              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    {doc.name.replace('.txt', '')}
                    {hasChanges && <span style={{ color: '#ff4d4f' }}> *</span>}
                  </span>
                }
                key={doc.id}
              >
                <div style={{ marginBottom: 16 }}>
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    最后修改：{new Date(doc.lastModified).toLocaleString()}
                    {hasChanges && (
                      <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                        (有未保存的更改)
                      </span>
                    )}
                  </span>
                </div>

                <div className="editor-container">
                  <MonacoEditor
                    height="600px"
                    language="markdown"
                    theme="vs-dark"
                    value={displayContent}
                    onChange={(value) => handleContentChange(value, doc.id)}
                    options={{
                      fontSize: 14,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </Card>
    </div>
  );
};

export default DocumentEditor;
