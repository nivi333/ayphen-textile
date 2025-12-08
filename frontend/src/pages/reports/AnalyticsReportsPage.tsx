import React, { useState, useEffect } from 'react';
import { useHeader } from '../../contexts/HeaderContext';
import { Typography, Card, Row, Col, Breadcrumb, Input, Tag } from 'antd';
import { SearchOutlined, BarChartOutlined, HistoryOutlined } from '@ant-design/icons';
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

const AnalyticsReportsPage: React.FC = () => {
  const { setHeaderActions } = useHeader();
  const [searchText, setSearchText] = useState('');
  
  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);
  
  const reportTypes: ReportType[] = [
    {
      id: 'sales-trends',
      name: 'Sales Trends',
      description: 'Sales trends over time with growth analysis',
      lastGenerated: '2025-12-05T09:30:00',
      frequency: 'Weekly',
      path: '/reports/analytics/sales-trends'
    },
    {
      id: 'product-performance',
      name: 'Product Performance',
      description: 'Top products by revenue, profit, and volume',
      lastGenerated: '2025-12-03T14:15:00',
      frequency: 'Weekly',
      path: '/reports/analytics/product-performance'
    },
    {
      id: 'customer-insights',
      name: 'Customer Insights',
      description: 'Customer behavior, loyalty, and value analysis',
      lastGenerated: '2025-11-30T10:45:00',
      frequency: 'Monthly',
      path: '/reports/analytics/customer-insights'
    },
    {
      id: 'business-performance',
      name: 'Business Performance',
      description: 'Revenue, profit margins, and ROI analysis',
      lastGenerated: '2025-12-01T15:20:00',
      frequency: 'Monthly',
      path: '/reports/analytics/business-performance'
    },
    {
      id: 'textile-analytics',
      name: 'Textile Analytics',
      description: 'Textile-specific production and quality metrics',
      lastGenerated: '2025-12-02T11:45:00',
      frequency: 'Weekly',
      path: '/reports/analytics/textile-analytics'
    }
  ];

  const navigate = useNavigate();
  
  const filteredReports = reportTypes.filter(report => 
    report.name.toLowerCase().includes(searchText.toLowerCase()) ||
    report.description.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'Daily': return 'green';
      case 'Weekly': return 'blue';
      case 'Monthly': return 'purple';
      case 'Quarterly': return 'orange';
      case 'Yearly': return 'red';
      default: return 'default';
    }
  };
  
  const formatDate = (date: string | null) => {
    if (!date) return null;
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="page-container">
        <div className="page-header-section">
          <Breadcrumb
            items={[
              { title: 'Home', href: '/' },
              { title: 'Reports', href: '/reports' },
              { title: 'Analytics Reports' }
            ]}
            className="breadcrumb-navigation"
          />
          <Title level={2}>Analytics Reports</Title>
          <Paragraph>
            View and generate analytics reports for business insights, trends, and performance metrics.
          </Paragraph>
        </div>

        <div className="filters-section">
          <Input
            placeholder="Search reports"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        <div className="reports-grid">
          <Row gutter={[16, 16]}>
            {filteredReports.map(report => (
              <Col xs={24} sm={12} md={8} lg={6} key={report.id}>
                <Card 
                  className="report-card"
                  hoverable
                  onClick={() => navigate(report.path)}
                >
                  <div className="report-card-icon">
                    <BarChartOutlined />
                  </div>
                  <div className="report-card-content">
                    <h3 className="report-card-title">{report.name}</h3>
                    <p className="report-card-description">{report.description}</p>
                    <div className="report-card-footer">
                      <Tag color={getFrequencyColor(report.frequency)}>{report.frequency}</Tag>
                      {report.lastGenerated ? (
                        <div className="report-last-generated">
                          <HistoryOutlined /> {formatDate(report.lastGenerated)}
                        </div>
                      ) : (
                        <Tag color="warning">Never Generated</Tag>
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

export default AnalyticsReportsPage;
