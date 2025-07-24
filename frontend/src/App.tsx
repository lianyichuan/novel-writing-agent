import React, { useState } from 'react';
import { Layout, Menu, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  TeamOutlined,
  RobotOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { AppProvider } from './store/AppContext';
import Dashboard from './components/Dashboard/Dashboard';
import DocumentEditor from './components/DocumentEditor/DocumentEditor';
import PlotTracker from './components/PlotTracker/PlotTracker';
import CharacterManager from './components/CharacterManager/CharacterManager';
import WritingAgent from './components/WritingAgent/WritingAgent';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type MenuKey = 'dashboard' | 'documents' | 'plots' | 'characters' | 'agent' | 'settings';

const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<MenuKey>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '主控制台',
    },
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: '文档管理',
    },
    {
      key: 'plots',
      icon: <NodeIndexOutlined />,
      label: '剧情追踪',
    },
    {
      key: 'characters',
      icon: <TeamOutlined />,
      label: '人物管理',
    },
    {
      key: 'agent',
      icon: <RobotOutlined />,
      label: '写作Agent',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'documents':
        return <DocumentEditor />;
      case 'plots':
        return <PlotTracker />;
      case 'characters':
        return <CharacterManager />;
      case 'agent':
        return <WritingAgent />;
      case 'settings':
        return <div>系统设置页面开发中...</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="dark"
          width={250}
        >
          <div className="logo">
            <Space>
              <RobotOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              {!collapsed && (
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  小说写作Agent
                </Title>
              )}
            </Space>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key as MenuKey)}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: '0 24px', background: '#001529' }}>
            <Title level={3} style={{ color: 'white', margin: '16px 0' }}>
              《龙渊谷变》写作管理系统
            </Title>
          </Header>
          <Content style={{ margin: '24px', background: '#f0f2f5' }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </AppProvider>
  );
};

export default App;
