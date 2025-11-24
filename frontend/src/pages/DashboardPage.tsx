import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
} from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useHeader } from '../contexts/HeaderContext';
import useAuth from '../contexts/AuthContext';
import { Heading } from '../components/Heading';
import { MainLayout } from '../components/layout';
import { GradientButton } from '../components/ui';
import UserInviteModal from '../components/users/UserInviteModal';
import './DashboardPage.scss';
import { COMPANY_TEXT } from '../constants/company';

const DashboardPage: React.FC = () => {
  const { currentCompany } = useAuth();
  const { setHeaderActions } = useHeader();
  const navigate = useNavigate();
  const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);

  // Set header actions when component mounts
  useEffect(() => {
    setHeaderActions(
      <GradientButton size='small' onClick={() => setInviteDrawerVisible(true)}>
        Invite Team Member
      </GradientButton>
    );

    // Cleanup when component unmounts
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const stats = [
    {
      title: COMPANY_TEXT.TOTAL_PRODUCTS,
      value: 0,
      icon: <BankOutlined />,
      color: '#7b5fc9',
    },
    {
      title: COMPANY_TEXT.ACTIVE_ORDERS,
      value: 0,
      icon: <ShoppingCartOutlined />,
      color: '#a2d8e5',
    },
    {
      title: COMPANY_TEXT.TEAM_MEMBERS,
      value: 0,
      icon: <TeamOutlined />,
      color: '#52c41a',
    },
    {
      title: COMPANY_TEXT.MONTHLY_REVENUE,
      value: '$0',
      icon: <BarChartOutlined />,
      color: '#faad14',
    },
  ];

  const quickActions = [
    {
      title: COMPANY_TEXT.ADD_PRODUCT,
      icon: <PlusOutlined />,
      description: COMPANY_TEXT.ADD_PRODUCT_DESC,
      action: () => navigate('/inventory'),
    },
    {
      title: COMPANY_TEXT.NEW_ORDER,
      icon: <ShoppingCartOutlined />,
      description: COMPANY_TEXT.NEW_ORDER_DESC,
      action: () => console.log('Navigate to new order'),
    },
    {
      title: COMPANY_TEXT.INVITE_TEAM,
      icon: <TeamOutlined />,
      description: COMPANY_TEXT.INVITE_TEAM_DESC,
      action: () => setInviteDrawerVisible(true),
    },
    {
      title: COMPANY_TEXT.VIEW_REPORTS,
      icon: <BarChartOutlined />,
      description: COMPANY_TEXT.VIEW_REPORTS_DESC,
      action: () => console.log('Navigate to reports'),
    },
  ];

  const handleInviteSuccess = () => {
    // Refresh any data if needed
    console.log('User invited successfully from dashboard');
  };

  return (
    <MainLayout>
      <div className='dashboard-container'>
        <div className='dashboard-content'>
          <div className='dashboard-stats'>
            <Row gutter={[16, 16]}>
              {stats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card className='dashboard-stat-card'>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                      valueStyle={{ color: stat.color }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <div className='dashboard-quick-actions'>
            <Heading level={3}>Quick Actions</Heading>
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card className='dashboard-action-card' hoverable onClick={action.action}>
                    <div className='dashboard-action-icon' style={{ color: '#7b5fc9' }}>
                      {action.icon}
                    </div>
                    <div className='dashboard-action-content'>
                      <h4>{action.title}</h4>
                      <p>{action.description}</p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <div className='dashboard-recent-activity'>
            <Heading level={3}>Recent Activity</Heading>
            <Card className='dashboard-activity-card'>
              <div className='dashboard-empty-state'>
                <BankOutlined style={{ fontSize: '48px', color: '#cbd5e1' }} />
                <Typography.Text>
                  <p>No recent activity</p>
                </Typography.Text>
                <Typography.Text>
                  <span>Start by creating your first product or order</span>
                </Typography.Text>
              </div>
            </Card>
          </div>
        </div>

        <UserInviteModal
          visible={inviteDrawerVisible}
          onClose={() => setInviteDrawerVisible(false)}
          onSuccess={handleInviteSuccess}
        />
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
