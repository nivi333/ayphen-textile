import React, { useState, useEffect } from 'react';
import { useHeader } from '../../contexts/HeaderContext';
import { Typography, Card, Row, Col, Breadcrumb, Input, Tag, Spin } from 'antd';
import { SearchOutlined, DollarOutlined, HistoryOutlined } from '@ant-design/icons';
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

const FinancialReportsPage: React.FC = () => {
  const { setHeaderActions } = useHeader();
  const [searchText, setSearchText] = useState('');
  
  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);
  
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch financial reports from API
  useEffect(() => {
    const fetchFinancialReports = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // const response = await reportService.getFinancialReportsList();
        // setReportTypes(response.data);
        
        // For now, we're defining the report structure but will fetch real data from API
        setReportTypes([
          {
            id: 'profit-loss',
            name: 'Profit & Loss Statement',
            description: 'Revenue, expenses, and profit analysis',
            lastGenerated: null,
            frequency: 'Monthly',
            path: '/reports/financial/profit-loss'
          },
          {
            id: 'balance-sheet',
            name: 'Balance Sheet',
            description: 'Assets, liabilities, and equity snapshot',
            lastGenerated: null,
            frequency: 'Monthly',
            path: '/reports/financial/balance-sheet'
          },
          {
            id: 'cash-flow',
            name: 'Cash Flow Statement',
            description: 'Cash inflows and outflows by activity',
            lastGenerated: null,
            frequency: 'Monthly',
            path: '/reports/financial/cash-flow'
          },
          {
            id: 'trial-balance',
            name: 'Trial Balance',
            description: 'Account-wise debit and credit balances',
            lastGenerated: null,
            frequency: 'Monthly',
            path: '/reports/financial/trial-balance'
          },
          {
            id: 'gst-reports',
            name: 'GST Reports',
            description: 'GSTR-1, GSTR-3B, and tax summaries',
            lastGenerated: null,
            frequency: 'Monthly',
            path: '/reports/financial/gst-reports'
          },
          {
            id: 'accounts-receivable',
            name: 'Accounts Receivable Aging',
            description: 'Outstanding customer invoices by age',
            lastGenerated: null,
            frequency: 'Weekly',
            path: '/reports/financial/accounts-receivable'
          },
          {
            id: 'accounts-payable',
            name: 'Accounts Payable Aging',
            description: 'Outstanding supplier bills by age',
            lastGenerated: null,
            frequency: 'Weekly',
            path: '/reports/financial/accounts-payable'
          },
          {
            id: 'expense-summary',
            name: 'Expense Summary',
            description: 'Expense breakdown by category and period',
            lastGenerated: null,
            frequency: 'Monthly',
            path: '/reports/financial/expense-summary'
          }
        ]);
      } catch (error) {
        console.error('Error fetching financial reports:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFinancialReports();
  }, []);

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
              { title: 'Financial Reports' }
            ]}
            className="breadcrumb-navigation"
          />
          <Title level={2}>Financial Reports</Title>
          <Paragraph>
            View and generate financial reports for revenue, expenses, and financial performance metrics.
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

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>Loading reports...</p>
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.length > 0 ? (
              <Row gutter={[16, 16]}>
                {filteredReports.map(report => (
                  <Col xs={24} sm={12} md={8} lg={6} key={report.id}>
                    <Card 
                      className="report-card"
                      hoverable
                      onClick={() => navigate(report.path)}
                    >
                      <div className="report-card-icon">
                        <DollarOutlined />
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
            ) : (
              <div className="no-reports-found">
                <p>No reports found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FinancialReportsPage;
