import React, { useState, useEffect } from 'react';
import { useHeader } from '../../contexts/HeaderContext';
import { Typography, Card, Row, Col, Breadcrumb, Input, Tag } from 'antd';
import { SearchOutlined, SafetyOutlined, HistoryOutlined } from '@ant-design/icons';
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

const QualityReportsPage: React.FC = () => {
  const { setHeaderActions } = useHeader();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const reportTypes: ReportType[] = [
    {
      id: 'inspection-summary',
      name: 'Inspection Summary',
      description: 'Quality inspection results and statistics',
      lastGenerated: null,
      frequency: 'Daily',
      path: '/reports/quality/inspection-summary',
    },
    {
      id: 'defect-analysis',
      name: 'Defect Analysis Report',
      description: 'Defect types, frequency, and root causes',
      lastGenerated: null,
      frequency: 'Weekly',
      path: '/reports/quality/defect-analysis',
    },
    {
      id: 'quality-trend',
      name: 'Quality Trend Report',
      description: 'Quality performance trends over time',
      lastGenerated: null,
      frequency: 'Monthly',
      path: '/reports/quality/quality-trend',
    },
    {
      id: 'compliance-report',
      name: 'Compliance Report',
      description: 'Regulatory compliance and certification status',
      lastGenerated: null,
      frequency: 'Monthly',
      path: '/reports/quality/compliance-report',
    },
    {
      id: 'rejection-rate',
      name: 'Rejection Rate Analysis',
      description: 'Product rejection rates and patterns',
      lastGenerated: null,
      frequency: 'Weekly',
      path: '/reports/quality/rejection-rate',
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
              { title: 'Quality Reports' },
            ]}
            className='breadcrumb-navigation'
          />
          <Title level={2}>Quality Reports</Title>
          <Paragraph>
            View and generate quality reports for inspections, defects, and compliance metrics.
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
                    <SafetyOutlined />
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

export default QualityReportsPage;
