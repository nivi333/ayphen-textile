import { ReactNode } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import { BrandLogo } from '../BrandLogo';
import { useHeader } from '../../contexts/HeaderContext';
import './MainLayout.scss';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { headerActions } = useHeader();

  return (
    <Layout className="main-layout">
      {/* Full Width Header */}
      <Header className="app-header">
        <div className="header-content">
          <BrandLogo width={120} height={28} />
          <div className="header-center">
            <h1 className="header-title">Welcome to Threading</h1>
            <p className="header-subtitle">Manage your textile manufacturing operations</p>
          </div>
          <div className="header-actions">
            {headerActions}
          </div>
        </div>
      </Header>
      
      {/* Sidebar + Content Layout */}
      <Layout className="content-layout">
        <Sidebar />
        <Content className="main-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <MainLayoutContent>{children}</MainLayoutContent>;
}
