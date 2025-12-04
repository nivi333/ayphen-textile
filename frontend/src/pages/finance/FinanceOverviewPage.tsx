import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { useNavigate } from 'react-router-dom';
import { useHeader } from '../../contexts/HeaderContext';
import { Heading } from '../../components/Heading';
import { MainLayout } from '../../components/layout';
import { GradientButton } from '../../components/ui';
import './FinanceOverviewPage.scss';

const FinanceOverviewPage: React.FC = () => {
  const { setHeaderActions } = useHeader();
  const navigate = useNavigate();

  useEffect(() => {
    setHeaderActions(
      <GradientButton size='small' onClick={() => navigate('/invoices')}>
        Create Invoice
      </GradientButton>
    );

    return () => setHeaderActions(null);
  }, [setHeaderActions, navigate]);

  // Revenue vs Expenses trend data
  const financialTrendData = [
    { month: 'Jan', type: 'Revenue', value: 180000 },
    { month: 'Jan', type: 'Expenses', value: 120000 },
    { month: 'Feb', type: 'Revenue', value: 195000 },
    { month: 'Feb', type: 'Expenses', value: 135000 },
    { month: 'Mar', type: 'Revenue', value: 210000 },
    { month: 'Mar', type: 'Expenses', value: 145000 },
    { month: 'Apr', type: 'Revenue', value: 205000 },
    { month: 'Apr', type: 'Expenses', value: 140000 },
    { month: 'May', type: 'Revenue', value: 225000 },
    { month: 'May', type: 'Expenses', value: 155000 },
    { month: 'Jun', type: 'Revenue', value: 235000 },
    { month: 'Jun', type: 'Expenses', value: 155000 },
  ];

  const lineConfig = {
    data: financialTrendData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#52c41a', '#ff4d4f'],
    legend: { position: 'top' as const },
    yAxis: {
      label: {
        formatter: (v: string) => `$${(Number(v) / 1000).toFixed(0)}K`,
      },
    },
    height: 350,
  };

  return (
    <MainLayout>
      <div className='finance-overview-page'>
        <div className='page-container'>
          <div className='page-header-section'>
            <Heading level={2}>Finance Overview</Heading>
          </div>

          {/* Key Financial Metrics */}
          <Row gutter={[16, 16]} className='finance-metrics-row'>
            <Col xs={24} sm={12} lg={6}>
              <Card className='finance-metric-card'>
                <Statistic
                  title='Total Revenue'
                  value={1250000}
                  prefix={<DollarOutlined />}
                  suffix={<RiseOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
                  valueStyle={{ color: '#7b5fc9', fontSize: '24px', fontWeight: 600 }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className='finance-metric-card'>
                <Statistic
                  title='Total Expenses'
                  value={850000}
                  prefix={<FallOutlined />}
                  valueStyle={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 600 }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className='finance-metric-card'>
                <Statistic
                  title='Net Profit'
                  value={400000}
                  prefix={<WalletOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 600 }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className='finance-metric-card'>
                <Statistic
                  title='Profit Margin'
                  value={32}
                  suffix='%'
                  valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 600 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Revenue vs Expenses Chart */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title='Revenue vs Expenses Trend' className='finance-chart-card'>
                <Line {...lineConfig} />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </MainLayout>
  );
};

export default FinanceOverviewPage;
