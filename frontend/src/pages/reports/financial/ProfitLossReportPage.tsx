import React, { useState, useEffect } from 'react';
import { useHeader } from '../../../contexts/HeaderContext';
import {
  Typography,
  Card,
  Row,
  Col,
  Breadcrumb,
  Input,
  Button,
  DatePicker,
  Table,
  Space,
  Spin,
  message,
} from 'antd';
import { SearchOutlined, FileTextOutlined, SaveOutlined } from '@ant-design/icons';
import MainLayout from '../../../components/layout/MainLayout';
import { reportService } from '../../../services/reportService';
import '../shared/ReportStyles.scss';
import { GradientButton } from '@/components/ui';
// Replace GradientButton with regular Button

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface ProfitLossData {
  key: string;
  account: string;
  category: string;
  amount: number;
  percentage: number;
}

const ProfitLossReportPage: React.FC = () => {
  const { setHeaderActions } = useHeader();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const handleGenerateReport = async () => {
    if (!dateRange) {
      message.error('Please select a date range');
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange[0].toISOString().split('T')[0];
      const endDate = dateRange[1].toISOString().split('T')[0];

      const data = await reportService.getProfitLossReport(startDate, endDate);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
      sorter: (a: ProfitLossData, b: ProfitLossData) => a.account.localeCompare(b.account),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: ProfitLossData) =>
        record.account.toLowerCase().includes(String(value).toLowerCase()) ||
        record.category.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a: ProfitLossData, b: ProfitLossData) => a.category.localeCompare(b.category),
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => amount.toFixed(2),
      sorter: (a: ProfitLossData, b: ProfitLossData) => a.amount - b.amount,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => `${percentage.toFixed(2)}%`,
      sorter: (a: ProfitLossData, b: ProfitLossData) => a.percentage - b.percentage,
    },
  ] as any;

  const getTableData = () => {
    if (!reportData) return [];

    const revenueData =
      reportData.revenueBreakdown?.map((item: any, index: number) => ({
        key: `revenue-${index}`,
        account: item.productName,
        category: 'Revenue',
        amount: item.revenue,
        percentage: item.percentage,
      })) || [];

    const expenseData =
      reportData.expenseBreakdown?.map((item: any, index: number) => ({
        key: `expense-${index}`,
        account: item.category,
        category: 'Expense',
        amount: item.amount,
        percentage: item.percentage,
      })) || [];

    return [...revenueData, ...expenseData];
  };

  return (
    <MainLayout>
      <div className='page-container'>
        <div className='page-header-section'>
          <Breadcrumb
            items={[
              { title: 'Home', href: '/' },
              { title: 'Reports', href: '/reports' },
              { title: 'Financial Reports', href: '/reports/financial' },
              { title: 'Profit & Loss Statement' },
            ]}
            className='breadcrumb-navigation'
          />
          <Title level={2}>Profit & Loss Statement</Title>
        </div>

        <div className='filters-section'>
          <div>
            <Space size='middle'>
              <RangePicker
                onChange={dates => {
                  if (dates) {
                    setDateRange([dates[0]?.toDate() as Date, dates[1]?.toDate() as Date]);
                  } else {
                    setDateRange(null);
                  }
                }}
              />
              <Input
                placeholder='Search accounts'
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </Space>
          </div>
          <div>
            <Space size='middle'>
              <Button icon={<SaveOutlined />}>Save Configuration</Button>
              <Button icon={<FileTextOutlined />}>PDF</Button>
              <Button type="primary" onClick={handleGenerateReport} loading={loading}>
                Generate Report
              </Button>
            </Space>
          </div>
        </div>

        {reportData && (
          <div className='report-summary-section'>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card className='summary-card'>
                  <div className='summary-title'>Total Revenue</div>
                  <div className='summary-value'>
                    ₹{reportData.summary?.totalRevenue?.toFixed(2) || '0.00'}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card className='summary-card'>
                  <div className='summary-title'>Cost of Goods Sold</div>
                  <div className='summary-value'>
                    ₹{reportData.summary?.costOfGoodsSold?.toFixed(2) || '0.00'}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card className='summary-card'>
                  <div className='summary-title'>Gross Profit</div>
                  <div className='summary-value'>
                    ₹{reportData.summary?.grossProfit?.toFixed(2) || '0.00'}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card className='summary-card'>
                  <div className='summary-title'>Operating Expenses</div>
                  <div className='summary-value'>
                    ₹{reportData.summary?.operatingExpenses?.toFixed(2) || '0.00'}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card className='summary-card'>
                  <div className='summary-title'>Net Profit</div>
                  <div className='summary-value'>
                    ₹{reportData.summary?.netProfit?.toFixed(2) || '0.00'}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card className='summary-card'>
                  <div className='summary-title'>Profit Margin</div>
                  <div className='summary-value'>
                    {reportData.summary?.profitMargin?.toFixed(2) || '0.00'}%
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        <div className='report-content-section'>
          <div className='report-data'>
            {loading ? (
              <div className='loading-container'>
                <Spin size='large' />
                <p>Generating report...</p>
              </div>
            ) : reportData ? (
              <Table
                columns={columns}
                dataSource={getTableData()}
                pagination={{ pageSize: 10 }}
                rowClassName={record =>
                  record.category === 'Expense' ? 'expense-row' : 'revenue-row'
                }
              />
            ) : (
              <div className='empty-report'>
                <p>
                  Select a date range and click "Generate Report" to view the Profit & Loss
                  Statement.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfitLossReportPage;
