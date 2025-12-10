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
  Select,
  Table,
  Space,
  Spin,
  message,
  Tag,
} from 'antd';
import { SearchOutlined, FileTextOutlined, SaveOutlined } from '@ant-design/icons';
import MainLayout from '../../../components/layout/MainLayout';
import '../shared/ReportStyles.scss';

const { Title } = Typography;
const { Option } = Select;

interface StockAgingData {
  key: string;
  product: string;
  location: string;
  stockQuantity: number;
  lastMovementDate: string;
  ageDays: number;
  status: string;
}

const StockAgingReportPage: React.FC = () => {
  const { setHeaderActions } = useHeader();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationId, setLocationId] = useState<string>('all');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call when backend endpoint is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.info('Stock Aging Report API endpoint not yet implemented');
      setReportData({
        summary: {
          totalProducts: 0,
          slowMovingItems: 0,
          averageAge: 0,
        },
        items: [],
      });
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      sorter: (a: StockAgingData, b: StockAgingData) => a.product.localeCompare(b.product),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: StockAgingData) =>
        record.product.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Stock Qty',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      sorter: (a: StockAgingData, b: StockAgingData) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: 'Last Movement',
      dataIndex: 'lastMovementDate',
      key: 'lastMovementDate',
    },
    {
      title: 'Age (Days)',
      dataIndex: 'ageDays',
      key: 'ageDays',
      sorter: (a: StockAgingData, b: StockAgingData) => a.ageDays - b.ageDays,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color =
          status === 'Slow Moving' ? 'warning' : status === 'Dead Stock' ? 'error' : 'success';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ] as any;

  return (
    <MainLayout>
      <div className='page-container'>
        <div className='page-header-section'>
          <Breadcrumb
            items={[
              { title: 'Home', href: '/' },
              { title: 'Reports', href: '/reports' },
              { title: 'Inventory Reports', href: '/reports/inventory' },
              { title: 'Stock Aging' },
            ]}
            className='breadcrumb-navigation'
          />
          <Title level={2}>Stock Aging Report</Title>
        </div>

        <div className='filters-section'>
          <div>
            <Space size='middle'>
              <Select
                value={locationId}
                onChange={setLocationId}
                style={{ width: 200 }}
                placeholder='Select Location'
              >
                <Option value='all'>All Locations</Option>
              </Select>
              <Input
                placeholder='Search products'
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
              <Button type='primary' onClick={handleGenerateReport} loading={loading}>
                Generate Report
              </Button>
            </Space>
          </div>
        </div>

        {reportData && (
          <div className='report-summary-section'>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card className='summary-card'>
                  <div className='summary-title'>Total Products</div>
                  <div className='summary-value'>{reportData.summary?.totalProducts || 0}</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className='summary-card'>
                  <div className='summary-title'>Slow Moving Items</div>
                  <div className='summary-value' style={{ color: '#faad14' }}>
                    {reportData.summary?.slowMovingItems || 0}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className='summary-card'>
                  <div className='summary-title'>Average Age (Days)</div>
                  <div className='summary-value'>{reportData.summary?.averageAge || 0}</div>
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
                dataSource={reportData.items}
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <div className='empty-report'>
                <p>Click "Generate Report" to view the Stock Aging Report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StockAgingReportPage;
