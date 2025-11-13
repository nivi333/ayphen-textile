import { ReactNode, useState } from 'react';
import { Layout, Button } from 'antd';
import Sidebar from './Sidebar';
import { BrandLogo } from '../BrandLogo';
import { useHeader } from '../../contexts/HeaderContext';
import useAuth from '../../contexts/AuthContext';
import './MainLayout.scss';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { headerActions } = useHeader();
  const { logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      logout();
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <Layout className='main-layout'>
      {/* Full Width Header */}
      <Header className='app-header'>
        <div className='header-content'>
          <BrandLogo width={120} height={28} />
          <div className='header-actions'>
            {headerActions}
            <Button
              type='default'
              danger
              loading={logoutLoading}
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              Logout
            </Button>
          </div>
        </div>
      </Header>

      {/* Sidebar + Content Layout */}
      <Layout className='content-layout'>
        <Sidebar />
        <Content className='main-content'>{children}</Content>
      </Layout>
    </Layout>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <MainLayoutContent>{children}</MainLayoutContent>;
}
