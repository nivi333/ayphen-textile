import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Row, Col, Select, DatePicker, Tooltip, App } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { dyeingFinishingService, DyeingFinishing, DYEING_PROCESSES } from '../../services/textileService';
import { DyeingFinishingDrawer } from '../../components/textile/DyeingFinishingDrawer';
import { PageHeader } from '../../components/layout/PageHeader';
import dayjs from 'dayjs';
import { useDebounce } from '../../hooks/useDebounce';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const DyeingFinishingListPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DyeingFinishing[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    processType: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | undefined>(undefined);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');

  const debouncedSearch = useDebounce(searchText, 500);

  const fetchProcesses = async (page = 1, pageSize = 10) => {
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

      const response = await dyeingFinishingService.getDyeingFinishing(queryParams);
      
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
      console.error('Error fetching processes:', error);
      message.error('Failed to load dyeing & finishing records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses(pagination.current, pagination.pageSize);
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
    setSelectedProcessId(undefined);
    setDrawerMode('create');
    setDrawerVisible(true);
  };

  const handleEdit = (record: DyeingFinishing) => {
    setSelectedProcessId(record.id);
    setDrawerMode('edit');
    setDrawerVisible(true);
  };

  const handleDelete = (record: DyeingFinishing) => {
    modal.confirm({
      title: 'Delete Process Record',
      content: `Are you sure you want to delete ${record.processType} batch ${record.batchNumber}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dyeingFinishingService.deleteDyeingFinishing(record.id);
          message.success('Record deleted successfully');
          fetchProcesses(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to delete record');
        }
      },
    });
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedProcessId(undefined);
  };

  const handleFormSuccess = () => {
    setDrawerVisible(false);
    fetchProcesses(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Process Type',
      dataIndex: 'processType',
      key: 'processType',
      width: 120,
      render: (type: string) => (
        <Tag color="purple">{DYEING_PROCESSES.find(p => p.value === type)?.label || type}</Tag>
      ),
    },
    {
      title: 'Batch No',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
    },
    {
      title: 'Color',
      key: 'color',
      render: (_: any, record: DyeingFinishing) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div 
            style={{ 
              width: 16, 
              height: 16, 
              borderRadius: '50%', 
              backgroundColor: record.colorCode,
              border: '1px solid #ddd'
            }} 
          />
          <span>{record.colorName}</span>
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantityMeters',
      key: 'quantityMeters',
      width: 120,
      align: 'right' as const,
      render: (qty: number) => `${qty.toLocaleString()} m`,
    },
    {
      title: 'QC Status',
      dataIndex: 'qualityCheck',
      key: 'qualityCheck',
      width: 100,
      align: 'center' as const,
      render: (passed: boolean) => (
        passed ? 
        <Tag color="success" icon={<CheckCircleOutlined />}>Passed</Tag> : 
        <Tag color="warning" icon={<CloseCircleOutlined />}>Pending</Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'processDate',
      key: 'processDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: DyeingFinishing) => (
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
    <div className="dyeing-finishing-list-page">
      <PageHeader
        title="Dyeing & Finishing"
        subtitle="Manage dyeing, printing, and finishing processes"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            New Process
          </Button>
        }
      />

      <Card bordered={false} className="filter-card" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search batch, color, or recipe..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Process Type"
              style={{ width: '100%' }}
              allowClear
              value={filters.processType}
              onChange={(val) => handleFilterChange('processType', val)}
            >
              {DYEING_PROCESSES.map(proc => (
                <Option key={proc.value} value={proc.value}>{proc.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker 
              style={{ width: '100%' }} 
              onChange={handleDateRangeChange}
            />
          </Col>
          <Col xs={24} sm={12} md={4} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchProcesses(pagination.current, pagination.pageSize)}
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

      <DyeingFinishingDrawer
        open={drawerVisible}
        onClose={handleDrawerClose}
        onSuccess={handleFormSuccess}
        mode={drawerMode}
        processId={selectedProcessId}
      />
    </div>
  );
};

export default DyeingFinishingListPage;
