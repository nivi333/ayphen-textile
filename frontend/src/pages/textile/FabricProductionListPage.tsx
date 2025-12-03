import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Row, Col, Select, DatePicker, Tooltip, App } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fabricProductionService, FabricProduction, FABRIC_TYPES, QUALITY_GRADES } from '../../services/textileService';
import { FabricProductionDrawer } from '../../components/textile/FabricProductionDrawer';
import { PageHeader } from '../../components/layout/PageHeader';
import dayjs from 'dayjs';
import { useDebounce } from '../../hooks/useDebounce';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const FabricProductionListPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FabricProduction[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    fabricType: undefined as string | undefined,
    qualityGrade: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedFabricId, setSelectedFabricId] = useState<string | undefined>(undefined);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');

  const debouncedSearch = useDebounce(searchText, 500);

  const fetchFabrics = async (page = 1, pageSize = 10) => {
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

      const response = await fabricProductionService.getFabricProductions(queryParams);
      // Adjust based on actual API response structure
      // Assuming response is { data: [], pagination: {} } or similar, but service returns array directly currently
      // Let's assume the service might need adjustment or returns array. 
      // Based on service code: return response.data || []
      // We might need to handle pagination if the API supports it, but the service currently returns just data array in getFabricProductions
      // If the backend supports pagination, we should update the service. For now, let's assume client-side pagination or update service later.
      // Actually, the backend controller likely returns pagination. 
      // Let's assume the service returns { data: [], pagination: {} } if updated, or just data.
      // For now, let's just set data.
      
      if (Array.isArray(response)) {
          setData(response);
          setPagination({ ...pagination, current: page, pageSize, total: response.length }); // Mock total if no pagination
      } else if ((response as any).fabrics) {
           setData((response as any).fabrics);
           setPagination({
               current: (response as any).pagination.page,
               pageSize: (response as any).pagination.limit,
               total: (response as any).pagination.total
           });
      }
      
    } catch (error) {
      console.error('Error fetching fabrics:', error);
      message.error('Failed to load fabric production records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFabrics(pagination.current, pagination.pageSize);
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
    setSelectedFabricId(undefined);
    setDrawerMode('create');
    setDrawerVisible(true);
  };

  const handleEdit = (record: FabricProduction) => {
    setSelectedFabricId(record.id); // Use internal ID for editing
    setDrawerMode('edit');
    setDrawerVisible(true);
  };

  const handleDelete = (record: FabricProduction) => {
    modal.confirm({
      title: 'Delete Fabric Production',
      content: `Are you sure you want to delete ${record.fabricName} (${record.batchNumber})?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await fabricProductionService.deleteFabricProduction(record.id);
          message.success('Fabric production record deleted successfully');
          fetchFabrics(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to delete record');
        }
      },
    });
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedFabricId(undefined);
  };

  const handleFormSuccess = () => {
    setDrawerVisible(false);
    fetchFabrics(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Fabric ID',
      dataIndex: 'fabricId',
      key: 'fabricId',
      width: 120,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Fabric Name',
      dataIndex: 'fabricName',
      key: 'fabricName',
      render: (text: string, record: FabricProduction) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.composition}</div>
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
      title: 'Type',
      dataIndex: 'fabricType',
      key: 'fabricType',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">{FABRIC_TYPES.find(t => t.value === type)?.label || type}</Tag>
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
      render: (_: any, record: FabricProduction) => (
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
    <div className="fabric-production-list-page">
      <PageHeader
        title="Fabric Production"
        subtitle="Manage fabric production records, batches, and quality"
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
              placeholder="Search fabric, batch, or color..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Fabric Type"
              style={{ width: '100%' }}
              allowClear
              value={filters.fabricType}
              onChange={(val) => handleFilterChange('fabricType', val)}
            >
              {FABRIC_TYPES.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Quality Grade"
              style={{ width: '100%' }}
              allowClear
              value={filters.qualityGrade}
              onChange={(val) => handleFilterChange('qualityGrade', val)}
            >
              {QUALITY_GRADES.map(grade => (
                <Option key={grade.value} value={grade.value}>{grade.label}</Option>
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
                onClick={() => fetchFabrics(pagination.current, pagination.pageSize)}
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

      <FabricProductionDrawer
        open={drawerVisible}
        onClose={handleDrawerClose}
        onSuccess={handleFormSuccess}
        mode={drawerMode}
        fabricId={selectedFabricId}
      />
    </div>
  );
};

export default FabricProductionListPage;
