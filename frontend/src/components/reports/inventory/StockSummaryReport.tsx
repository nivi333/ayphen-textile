import React, { useState } from 'react';
import { Button, Select, Table, Space, Spin, Tag } from 'antd';
import { FileTextOutlined, SaveOutlined } from '@ant-design/icons';
import '../../../pages/reports/shared/ReportStyles.scss';

const { Option } = Select;

interface StockSummaryData {
  key: string;
  product: string;
  location: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  status: string;
}

interface StockSummaryReportProps {
  data: any;
  loading: boolean;
  searchText: string;
}

const StockSummaryReport: React.FC<StockSummaryReportProps> = ({ data, loading, searchText }) => {
  const [locationId, setLocationId] = useState<string>('all');

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      sorter: (a: StockSummaryData, b: StockSummaryData) => a.product.localeCompare(b.product),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: StockSummaryData) =>
        record.product.toLowerCase().includes(String(value).toLowerCase()) ||
        record.location.toLowerCase().includes(String(value).toLowerCase()),
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
      sorter: (a: StockSummaryData, b: StockSummaryData) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: 'Reserved',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      sorter: (a: StockSummaryData, b: StockSummaryData) => a.reservedQuantity - b.reservedQuantity,
    },
    {
      title: 'Available',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      sorter: (a: StockSummaryData, b: StockSummaryData) =>
        a.availableQuantity - b.availableQuantity,
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color =
          status === 'Low Stock' ? 'warning' : status === 'Out of Stock' ? 'error' : 'success';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ] as any;

  const getTableData = () => {
    if (!data || !data.items) return [];

    return data.items.map((item: any, index: number) => ({
      key: `item-${index}`,
      product: item.productName || item.product,
      location: item.locationName || item.location || 'All Locations',
      stockQuantity: item.stockQuantity || item.quantity || 0,
      reservedQuantity: item.reservedQuantity || item.reserved || 0,
      availableQuantity: item.availableQuantity || item.available || 0,
      reorderLevel: item.reorderLevel || 0,
      status: item.status || 'Adequate',
    }));
  };

  return (
    <div className='report-container'>
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
          </Space>
        </div>
        <div>
          <Space size='middle'>
            <Button icon={<SaveOutlined />}>Save Configuration</Button>
            <Button icon={<FileTextOutlined />}>PDF</Button>
          </Space>
        </div>
      </div>

      <div className='report-content-section'>
        <div className='report-data'>
          {loading ? (
            <div className='loading-container'>
              <Spin size='large' />
              <p>Generating report...</p>
            </div>
          ) : (
            <Table columns={columns} dataSource={getTableData()} pagination={{ pageSize: 10 }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSummaryReport;
