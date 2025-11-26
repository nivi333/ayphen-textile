import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Avatar, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  message, 
  Dropdown,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  PlusOutlined, 
  MoreOutlined,
  WarningOutlined,
  StockOutlined,
  SwapOutlined,
  BookOutlined,
  AlertOutlined,
  AppstoreOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Heading } from '../components/Heading';
import { inventoryService, LocationInventory, InventoryFilters } from '../services/inventoryService';
import { locationService } from '../services/locationService';
import useAuth from '../contexts/AuthContext';
import ProductSelector from '../components/products/ProductSelector';
import { StockMovementModal, StockReservationModal, StockAlertsCard } from '../components/inventory';
import './InventoryListPage.scss';

const { Option } = Select;
const { Text } = Typography;

interface Location {
  id: string;
  locationId: string;
  name: string;
  isDefault: boolean;
  isHeadquarters: boolean;
}

const InventoryListPage: React.FC = () => {
  const [inventory, setInventory] = useState<LocationInventory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [searchText, setSearchText] = useState('');
  const [stockMovementModalVisible, setStockMovementModalVisible] = useState(false);
  const [stockReservationModalVisible, setStockReservationModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LocationInventory | null>(null);
  const { currentCompany } = useAuth();
  const fetchRef = useRef<boolean>(false);

  // Statistics
  const totalProducts = inventory.length;
  const lowStockItems = inventory.filter(item => 
    item.reorderLevel && item.availableQuantity <= item.reorderLevel
  ).length;
  const outOfStockItems = inventory.filter(item => item.availableQuantity <= 0).length;
  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.stockQuantity * item.product.costPrice), 0
  );

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      if (!currentCompany?.id) return;

      try {
        const response = await locationService.getLocations();
        setLocations(response || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, [currentCompany?.id]);

  // Fetch inventory data
  const fetchInventory = async () => {
    if (!currentCompany?.id || fetchRef.current) return;

    fetchRef.current = true;
    setLoading(true);

    try {
      const response = await inventoryService.getLocationInventory(filters);
      if (response.success) {
        setInventory(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      message.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
      fetchRef.current = false;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [currentCompany?.id, filters]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setFilters(prev => ({ ...prev, search: value || undefined }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof InventoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchText('');
  };

  // Get stock status
  const getStockStatus = (item: LocationInventory) => {
    if (item.availableQuantity <= 0) {
      return { status: 'error', text: 'Out of Stock', color: '#ff4d4f' };
    }
    if (item.reorderLevel && item.availableQuantity <= item.reorderLevel) {
      return { status: 'warning', text: 'Low Stock', color: '#faad14' };
    }
    return { status: 'success', text: 'In Stock', color: '#52c41a' };
  };

  // Table columns
  const columns: ColumnsType<LocationInventory> = [
    {
      title: 'Product',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            size={40}
            src={record.product.imageUrl}
            icon={<AppstoreOutlined />}
            style={{ 
              backgroundColor: record.product.imageUrl ? undefined : '#f0f0f0',
              color: '#666'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
              {record.product.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.product.productCode} • {record.product.sku}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px' }}>
            {record.location.name}
          </div>
          <Space size={4} style={{ marginTop: '2px' }}>
            {record.location.isHeadquarters && (
              <Tag color="blue">HQ</Tag>
            )}
            {record.location.isDefault && (
              <Tag color="green">Default</Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: 'Stock Quantity',
      key: 'stockQuantity',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '16px' }}>
            {record.stockQuantity}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.product.unitOfMeasure}
          </div>
        </div>
      ),
    },
    {
      title: 'Reserved',
      key: 'reservedQuantity',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#fa8c16' }}>
            {record.reservedQuantity}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.product.unitOfMeasure}
          </div>
        </div>
      ),
    },
    {
      title: 'Available',
      key: 'availableQuantity',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const status = getStockStatus(record);
        return (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '16px', color: status.color }}>
              {record.availableQuantity}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.product.unitOfMeasure}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const status = getStockStatus(record);
        return (
          <Tag color={status.status} style={{ margin: 0 }}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: 'Reorder Level',
      key: 'reorderLevel',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          {record.reorderLevel ? (
            <>
              <div style={{ fontWeight: 500, fontSize: '14px' }}>
                {record.reorderLevel}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.product.unitOfMeasure}
              </div>
            </>
          ) : (
            <Text type="secondary">Not set</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Value',
      key: 'value',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>
            ₹{(record.stockQuantity * record.product.costPrice).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            @ ₹{record.product.costPrice}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'adjust',
                label: 'Adjust Stock',
                icon: <StockOutlined />,
                onClick: () => handleStockAdjustment(record),
              },
              {
                key: 'transfer',
                label: 'Transfer Stock',
                icon: <SwapOutlined />,
                onClick: () => handleStockTransfer(record),
              },
              {
                key: 'reserve',
                label: 'Reserve Stock',
                icon: <BookOutlined />,
                onClick: () => handleStockReservation(record),
              },
              {
                key: 'history',
                label: 'View History',
                icon: <AlertOutlined />,
                onClick: () => handleViewHistory(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
            style={{ color: '#666' }}
          />
        </Dropdown>
      ),
    },
  ];

  // Action handlers
  const handleStockAdjustment = (record: LocationInventory) => {
    setSelectedRecord(record);
    setStockMovementModalVisible(true);
  };

  const handleStockTransfer = (record: LocationInventory) => {
    setSelectedRecord(record);
    setStockMovementModalVisible(true);
  };

  const handleStockReservation = (record: LocationInventory) => {
    setSelectedRecord(record);
    setStockReservationModalVisible(true);
  };

  const handleViewHistory = (_record: LocationInventory) => {
    message.info('Stock history feature coming soon');
  };

  // Modal handlers
  const handleModalSuccess = () => {
    fetchInventory();
  };

  const handleStockMovementModalClose = () => {
    setStockMovementModalVisible(false);
    setSelectedRecord(null);
  };

  const handleStockReservationModalClose = () => {
    setStockReservationModalVisible(false);
    setSelectedRecord(null);
  };

  return (
    <div className="inventory-list-page">
      {/* Header */}
      <div className="inventory-header">
        <div className="inventory-header-content">
          <Heading level={2}>Inventory Management</Heading>
          <div className="inventory-header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => message.info('Add inventory feature coming soon')}
            >
              Add Inventory
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards and Alerts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={totalProducts}
              prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={lowStockItems}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: lowStockItems > 0 ? '#faad14' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={outOfStockItems}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: outOfStockItems > 0 ? '#ff4d4f' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={totalValue}
              prefix="₹"
              precision={0}
              formatter={(value) => `${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Stock Alerts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <StockAlertsCard maxItems={3} />
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Select location"
              style={{ width: '100%' }}
              value={filters.locationId}
              onChange={(value) => handleFilterChange('locationId', value)}
              allowClear
            >
              {locations.map(location => (
                <Option key={location.id} value={location.id}>
                  {location.name}
                  {location.isHeadquarters && ' (HQ)'}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProductSelector
              placeholder="Select product"
              style={{ width: '100%' }}
              value={filters.productId}
              onChange={(value) => handleFilterChange('productId', value)}
              allowClear
              showStockInfo={false}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Select
                placeholder="Stock status"
                style={{ width: '120px' }}
                onChange={(value) => {
                  handleFilterChange('lowStock', value === 'low' ? true : undefined);
                  handleFilterChange('outOfStock', value === 'out' ? true : undefined);
                }}
                allowClear
              >
                <Option value="low">Low Stock</Option>
                <Option value="out">Out of Stock</Option>
              </Select>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchInventory}
                  loading={loading}
                />
              </Tooltip>
              <Button
                icon={<FilterOutlined />}
                onClick={clearFilters}
                disabled={Object.keys(filters).length === 0}
              >
                Clear
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="id"
          loading={loading}
          pagination={{
            total: inventory.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Modals */}
      <StockMovementModal
        visible={stockMovementModalVisible}
        onClose={handleStockMovementModalClose}
        onSuccess={handleModalSuccess}
        initialProductId={selectedRecord?.productId}
        initialLocationId={selectedRecord?.locationId}
      />

      <StockReservationModal
        visible={stockReservationModalVisible}
        onClose={handleStockReservationModalClose}
        onSuccess={handleModalSuccess}
        initialProductId={selectedRecord?.productId}
        initialLocationId={selectedRecord?.locationId}
      />
    </div>
  );
};

export default InventoryListPage;
