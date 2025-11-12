import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Button, Modal, Form, Input, Select, message } from 'antd';
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
import './DashboardPage.scss';
import { COMPANY_TEXT } from '../constants/company';

const DashboardPage: React.FC = () => {
  const { currentCompany } = useAuth();
  const { setHeaderActions } = useHeader();
  const navigate = useNavigate();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [form] = Form.useForm();

  // Set header actions when component mounts
  useEffect(() => {
    setHeaderActions(
      <Button
        type='primary'
        icon={<PlusOutlined />}
        onClick={() => setInviteModalVisible(true)}
      >
        Invite Team Member
      </Button>
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
      action: () => setInviteModalVisible(true),
    },
    {
      title: COMPANY_TEXT.VIEW_REPORTS,
      icon: <BarChartOutlined />,
      description: COMPANY_TEXT.VIEW_REPORTS_DESC,
      action: () => console.log('Navigate to reports'),
    },
  ];

  const handleInviteUser = async (values: any) => {
    if (!currentCompany) return;

    setInviting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/companies/${currentCompany.id}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            email: values.email,
            role: values.role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      message.success('Invitation sent successfully!');
      setInviteModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
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
                <p>No recent activity</p>
                <span>Start by creating your first product or order</span>
              </div>
            </Card>
          </div>
        </div>

        <Modal
          title='Invite Team Member'
          open={inviteModalVisible}
          onCancel={() => setInviteModalVisible(false)}
          footer={null}
          width={400}
        >
          <Form form={form} layout='vertical' onFinish={handleInviteUser}>
            <Form.Item
              name='email'
              label='Email Address'
              rules={[
                { required: true, message: 'Please enter an email address' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >
              <Input placeholder='user@example.com' />
            </Form.Item>

            <Form.Item
              name='role'
              label='Role'
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder='Select role'>
                <Select.Option value='EMPLOYEE'>Employee</Select.Option>
                <Select.Option value='MANAGER'>Manager</Select.Option>
                <Select.Option value='ADMIN'>Admin</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item className='text-right'>
              <Button onClick={() => setInviteModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type='primary' htmlType='submit' loading={inviting}>
                Send Invitation
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
