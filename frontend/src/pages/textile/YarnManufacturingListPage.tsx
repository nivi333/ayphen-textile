import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Row, Col, Select, DatePicker, Tooltip, App } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { yarnManufacturingService, YarnManufacturing, YARN_TYPES, QUALITY_GRADES, YARN_PROCESSES } from '../../services/textileService';
import { YarnManufacturingDrawer } from '../../components/textile/YarnManufacturingDrawer';
import { PageHeader } from '../../components/layout/PageHeader';
import dayjs from 'dayjs';
import { useDebounce } from '../../hooks/useDebounce';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const YarnManufacturingListPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<YarnManufacturing[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    yarnType: undefined as string | undefined,
    processType: undefined as string | undefined,
    qualityGrade: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedYarnId, setSelectedYarnId] = useState<string | undefined>(undefined);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');

  const debouncedSearch = useDebounce(searchText, 500);

  const fetchYarns = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const queryParams: any = {
        page,
        limit: pageSize,
        search: debouncedSearch,
        ...filters,
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => 
        queryParams[key] === undefined && delete queryParams[key]
      );

      const response = await yarnManufacturingService.getYarnManufacturing(queryParams);
      
      if (Array.isArray(response)) {
          setData(response);
          setPagination({ ...pagination, current: page, pageSize, total: response.length });
      } else if ((response as any).data) {
           setData((response as any).data);
           setPagination({
               current: (response as any).pagination?.page || 1,
               pageSize: (response as any).pagination?.limit || 10,
               total: (response as any).pagination?.total || 0
           });
      }
      
    } catch (error) {
      console.error('Error fetching yarns:', error);
      message.error('Failed to load yarn manufacturing records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYarns(pagination.current, pagination.pageSize);
  }, [debouncedSearch, filters, pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination({ ...pagination, current: 1 });
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setFilters(prev => ({
      ...prev,
      startDate: dateStrings[0] || undefined,
      endDate: dateStrings[1] || undefined,
    }));
    setPagination({ ...pagination, current: 1 });
  };

  const handleCreate = () => {
    setSelectedYarnId(undefined);
    setDrawerMode('create');
    setDrawerVisible(true);
  };

  const handleEdit = (record: YarnManufacturing) => {
    setSelectedYarnId(record.id);
    setDrawerMode('edit');
    setDrawerVisible(true);
  };

  const handleDelete = (record: YarnManufacturing) => {
    modal.confirm({
      title: 'Delete Yarn Production',
      content: `Are you sure you want to delete ${record.yarnType} ${record.yarnCount} (${record.batchNumber})?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await yarnManufacturingService.deleteYarnManufacturing(record.id);
          message.success('Record deleted successfully');
          fetchYarns(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to delete record');
        }
      },
    });
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedYarnId(undefined);
  };

  const handleFormSuccess = () => {
    setDrawerVisible(false);
    fetchYarns(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Yarn ID',
      dataIndex: 'yarnId',
      key: 'yarnId',
      width: 120,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Type / Count',
      key: 'typeCount',
      render: (_: any, record: YarnManufacturing) => (
        <div>
          <div style={{ fontWeight: 500 }}>
             {YARN_TYPES.find(t => t.value === record.yarnType)?.label || record.yarnType}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.yarnCount} • {record.ply} Ply</div>
        </div>
      ),
    },
    {
      title: 'Batch No',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
    },
    {
      title: 'Process',
      dataIndex: 'processType',
      key: 'processType',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">{YARN_PROCESSES.find(p => p.value === type)?.label || type}</Tag>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantityKg',
      key: 'quantityKg',
      width: 120,
      align: 'right' as const,
      render: (qty: number) => `${qty.toLocaleString()} kg`,
    },
    {
      title: 'Grade',
      dataIndex: 'qualityGrade',
      key: 'qualityGrade',
      width: 100,
      render: (grade: string) => {
        let color = 'default';
        if (grade === 'A_GRADE') color = 'success';
        if (grade === 'B_GRADE') color = 'warning';
        if (grade === 'REJECT') color = 'error';
        return <Tag color={color}>{QUALITY_GRADES.find(g => g.value === grade)?.label || grade}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'productionDate',
      key: 'productionDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: YarnManufacturing) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="yarn-manufacturing-list-page">
      <PageHeader
        title="Yarn Manufacturing"
        subtitle="Manage yarn production, spinning, and processing"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            New Production
          </Button>
        }
      />

      <Card bordered={false} className="filter-card" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search yarn, batch, or count..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Yarn Type"
              style={{ width: '100%' }}
              allowClear
              value={filters.yarnType}
              onChange={(val) => handleFilterChange('yarnType', val)}
            >
              {YARN_TYPES.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Process"
              style={{ width: '100%' }}
              allowClear
              value={filters.processType}
              onChange={(val) => handleFilterChange('processType', val)}
            >
              {YARN_PROCESSES.map(proc => (
                <Option key={proc.value} value={proc.value}>{proc.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker 
              style={{ width: '100%' }} 
              onChange={handleDateRangeChange}
            />
          </Col>
          <Col xs={24} sm={12} md={4} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchYarns(pagination.current, pagination.pageSize)}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} className="table-card">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      <YarnManufacturingDrawer
        open={drawerVisible}
        onClose={handleDrawerClose}
        onSuccess={handleFormSuccess}
        mode={drawerMode}
        yarnId={selectedYarnId}
      />
    </div>
  );
};

export default YarnManufacturingListPage;
