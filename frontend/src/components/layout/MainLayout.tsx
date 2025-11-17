import { ReactNode, useState } from 'react';
import { Layout, Button, Avatar } from 'antd';
import Sidebar from './Sidebar';
import { BrandLogo } from '../BrandLogo';
import { useHeader } from '../../contexts/HeaderContext';
import useAuth from '../../contexts/AuthContext';
import { UserOutlined } from '@ant-design/icons';
import './MainLayout.scss';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { headerActions } = useHeader();
  const { logout, user } = useAuth();
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
            {user && (
              <div className='header-user'>
                <Avatar size={36} icon={<UserOutlined />}>
                  {`${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.trim() ||
                    undefined}
                </Avatar>
                <div className='header-user-info'>
                  <span className='header-user-name'>
                    {user.firstName} {user.lastName}
                  </span>
                  <span className='header-user-email'>{user.email}</span>
                </div>
              </div>
            )}
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
