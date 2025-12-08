import React, { useState, useEffect } from 'react';
import { useHeader } from '../../contexts/HeaderContext';
import { Typography, Card, Row, Col, Breadcrumb, Input, Tag } from 'antd';
import { SearchOutlined, ShoppingOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import './shared/ReportStyles.scss';

const { Title, Paragraph } = Typography;

interface ReportType {
  id: string;
  name: string;
  description: string;
  lastGenerated: string | null;
  frequency: string;
  path: string;
}

const SalesReportsPage: React.FC = () => {
  const { setHeaderActions } = useHeader();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const reportTypes: ReportType[] = [
    {
      id: 'sales-summary',
      name: 'Sales Summary',
      description: 'Sales breakdown by period, product, and customer',
      lastGenerated: '2025-12-05T09:30:00',
      frequency: 'Daily',
      path: '/reports/sales/sales-summary',
    },
    {
      id: 'sales-trend',
      name: 'Sales Trend Analysis',
      description: 'Sales performance trends over time',
      lastGenerated: '2025-12-01T14:15:00',
      frequency: 'Weekly',
      path: '/reports/sales/sales-trend',
    },
    {
      id: 'top-products',
      name: 'Top Selling Products',
      description: 'Best performing products by revenue and quantity',
      lastGenerated: '2025-12-04T16:45:00',
      frequency: 'Weekly',
      path: '/reports/sales/top-products',
    },
    {
      id: 'customer-analysis',
      name: 'Customer Purchase History',
      description: 'Customer-wise sales and purchase patterns',
      lastGenerated: '2025-11-30T11:20:00',
      frequency: 'Monthly',
      path: '/reports/sales/customer-analysis',
    },
    {
      id: 'sales-by-region',
      name: 'Sales by Region/Location',
      description: 'Geographic sales distribution analysis',
      lastGenerated: '2025-11-28T15:45:00',
      frequency: 'Monthly',
      path: '/reports/sales/sales-by-region',
    },
  ];

  const navigate = useNavigate();

  const filteredReports = reportTypes.filter(
    report =>
      report.name.toLowerCase().includes(searchText.toLowerCase()) ||
      report.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'Daily':
        return 'green';
      case 'Weekly':
        return 'blue';
      case 'Monthly':
        return 'purple';
      case 'Quarterly':
        return 'orange';
      case 'Yearly':
        return 'red';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;

    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MainLayout>
      <div className='page-container'>
        <div className='page-header-section'>
          <Breadcrumb
            items={[
              { title: 'Home', href: '/' },
              { title: 'Reports', href: '/reports' },
              { title: 'Sales Reports' },
            ]}
            className='breadcrumb-navigation'
          />
          <Title level={2}>Sales Reports</Title>
          <Paragraph>
            View and generate sales reports for revenue, customer insights, and sales performance
            metrics.
          </Paragraph>
        </div>

        <div className='filters-section'>
          <Input
            placeholder='Search reports'
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        <div className='reports-grid'>
          <Row gutter={[16, 16]}>
            {filteredReports.map(report => (
              <Col xs={24} sm={12} md={8} lg={6} key={report.id}>
                <Card className='report-card' hoverable onClick={() => navigate(report.path)}>
                  <div className='report-card-icon'>
                    <ShoppingOutlined />
                  </div>
                  <div className='report-card-content'>
                    <h3 className='report-card-title'>{report.name}</h3>
                    <p className='report-card-description'>{report.description}</p>
                    <div className='report-card-footer'>
                      <Tag color={getFrequencyColor(report.frequency)}>{report.frequency}</Tag>
                      {report.lastGenerated ? (
                        <div className='report-last-generated'>
                          <HistoryOutlined /> {formatDate(report.lastGenerated)}
                        </div>
                      ) : (
                        <Tag color='warning'>Never Generated</Tag>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </MainLayout>
  );
};

export default SalesReportsPage;
