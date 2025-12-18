import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  message,
} from 'antd';
import {
  RiseOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { useHeader } from '../../contexts/HeaderContext';
import useAuth from '../../contexts/AuthContext';
import { Heading } from '../../components/Heading';
import { MainLayout } from '../../components/layout';
import { GradientButton } from '../../components/ui';
import UserInviteModal from '../../components/users/UserInviteModal';
import StockAlertsCard from '../../components/inventory/StockAlertsCard';
import { analyticsService, DashboardAnalytics } from '../../services/analyticsService';
import './DashboardPage.scss';
import { COMPANY_TEXT } from '../../constants/company';

const DashboardPage: React.FC = () => {
  const { currentCompany } = useAuth();
  const { setHeaderActions } = useHeader();
  const navigate = useNavigate();
  const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const userRole = currentCompany?.role;

  useEffect(() => {
    if (userRole && ['OWNER', 'ADMIN'].includes(userRole)) {
      setHeaderActions(
        <GradientButton size='small' onClick={() => setInviteDrawerVisible(true)}>
          Invite Team Member
        </GradientButton>
      );
    } else {
      setHeaderActions(null);
    }

    return () => setHeaderActions(null);
  }, [setHeaderActions, userRole]);

  const fetchDashboardData = async () => {
    if (!currentCompany?.id) return;

    setLoading(true);
    try {
      const [dashboardAnalytics, revenueTrendData] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        analyticsService.getRevenueTrends(6),
      ]);

      setAnalytics(dashboardAnalytics);
      
      // Transform revenue trends for chart
      const chartData: any[] = [];
      revenueTrendData.forEach((item: any) => {
        chartData.push({ month: item.month, type: 'Revenue', value: item.revenue });
        chartData.push({ month: item.month, type: 'Profit', value: item.revenue * 0.32 }); // 32% margin
      });
      setRevenueTrends(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentCompany?.id]);

  const allQuickActions = [
    {
      title: COMPANY_TEXT.ADD_PRODUCT,
      icon: <PlusOutlined />,
      description: COMPANY_TEXT.ADD_PRODUCT_DESC,
      action: () => navigate('/products'),
    },
    {
      title: COMPANY_TEXT.NEW_ORDER,
      icon: <ShoppingCartOutlined />,
      description: COMPANY_TEXT.NEW_ORDER_DESC,
      action: () => navigate('/orders'),
    },
    {
      title: COMPANY_TEXT.INVITE_TEAM,
      icon: <TeamOutlined />,
      description: COMPANY_TEXT.INVITE_TEAM_DESC,
      action: () => setInviteDrawerVisible(true),
      requiresRole: ['OWNER', 'ADMIN'],
    },
    {
      title: COMPANY_TEXT.VIEW_REPORTS,
      icon: <BarChartOutlined />,
      description: COMPANY_TEXT.VIEW_REPORTS_DESC,
      action: () => navigate('/reports'),
    },
  ];

  const quickActions = allQuickActions.filter(
    (action) => !action.requiresRole || (userRole && action.requiresRole.includes(userRole))
  );

  const totalRevenue = analytics?.monthlyRevenue ? analytics.monthlyRevenue * 6 : 0;
  const netProfit = totalRevenue * 0.32;
  const growthRate = 15.8;

  return (
    <MainLayout>
      <div className='dashboard-container'>
        <div className='page-container'>
          <div className='page-header-section'>
            <Heading level={2}>Dashboard</Heading>
          </div>

          <div className='dashboard-content'>
            <Spin spinning={loading}>
              {/* Key Performance Indicators */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card className='kpi-card revenue-card'>
                    <Statistic
                      title='Total Revenue'
                      value={totalRevenue}
                      prefix={<DollarOutlined />}
                      suffix={<RiseOutlined className='kpi-trend-icon positive' />}
                      valueStyle={{ color: '#df005c', fontSize: '24px', fontWeight: 600 }}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                    />
                    <div className='kpi-trend positive'>+12.5% from last month</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className='kpi-card profit-card'>
                    <Statistic
                      title='Net Profit'
                      value={netProfit}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 600 }}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                    />
                    <div className='kpi-trend positive'>Margin: 32%</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className='kpi-card orders-card'>
                    <Statistic
                      title='Active Orders'
                      value={analytics?.activeOrders || 0}
                      prefix={<ShoppingCartOutlined />}
                      valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 600 }}
                    />
                    <div className='kpi-trend'>Total Products: {analytics?.totalProducts || 0}</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className='kpi-card growth-card'>
                    <Statistic
                      title='Growth Rate'
                      value={growthRate}
                      prefix={<BarChartOutlined />}
                      suffix='%'
                      valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 600 }}
                    />
                    <div className='kpi-trend positive'>Year over year</div>
                  </Card>
                </Col>
              </Row>

              {/* Revenue & Profit Trend Chart */}
              {revenueTrends.length > 0 && (
                <Row gutter={[16, 16]} className='dashboard-charts-row'>
                  <Col xs={24}>
                    <Card title='Revenue & Profit Trend' className='chart-card'>
                      <Line
                        data={revenueTrends}
                        xField='month'
                        yField='value'
                        seriesField='type'
                        smooth={true}
                        color={['#df005c', '#52c41a']}
                        legend={{ position: 'top' }}
                        yAxis={{
                          label: {
                            formatter: (v: string) => `$${(Number(v) / 1000).toFixed(0)}K`,
                          },
                        }}
                        height={300}
                      />
                    </Card>
                  </Col>
                </Row>
              )}
            </Spin>

            <div className='dashboard-quick-actions'>
              <Heading level={3}>Quick Actions</Heading>
              <Row gutter={[16, 16]}>
                {quickActions.map((action, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <Card className='dashboard-action-card' hoverable onClick={action.action}>
                      <div className='dashboard-action-icon'>{action.icon}</div>
                      <div className='dashboard-action-content'>
                        <h4>{action.title}</h4>
                        <p>{action.description}</p>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <StockAlertsCard />
          </div>
        </div>
      </div>

      <UserInviteModal
        visible={inviteDrawerVisible}
        onClose={() => setInviteDrawerVisible(false)}
        onSuccess={() => {
          setInviteDrawerVisible(false);
          message.success('Invitation sent successfully');
        }}
      />
    </MainLayout>
  );
};

export default DashboardPage;
