import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Modal,
  Form,
  InputNumber,
  message,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AlertOutlined,
  BoxPlotOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import useAuth from '../contexts/AuthContext';
import { MainLayout } from '../components/layout';
import { Heading } from '../components/Heading';
import '../constants/company';

const { Option } = Select;

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  fiberType?: string;
  yarnCount?: string;
  gsm?: number;
  fabricType?: string;
  color?: string;
  width?: number;
  uom: string;
  currentStock: number;
  availableStock: number;
  minStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  qualityStatus: string;
  location: {
    id: string;
    name: string;
  };
  primarySupplier?: {
    id: string;
    name: string;
  };
}

interface InventorySummary {
  totalItems: number;
  totalStockValue: number;
  totalStockQuantity: number;
  availableStockQuantity: number;
  lowStockItemsCount: number;
}

const InventoryPage: React.FC = () => {
  const { currentCompany } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();

  // Load inventory data
  const loadInventoryData = async () => {
    if (!currentCompany) return;

    setLoading(true);
    try {
      // Load inventory items
      const params = new URLSearchParams({
        search: searchText,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedLocation && { locationId: selectedLocation }),
        ...(showLowStockOnly && { lowStock: 'true' }),
      });

      const itemsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/inventory/items?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.data || []);
      }

      // Load summary
      const summaryResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/inventory/summary`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.data);
      }

      // Load low stock alerts
      const alertsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/inventory/alerts/low-stock`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setLowStockItems(alertsData.data || []);
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
      message.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [currentCompany, searchText, selectedCategory, selectedLocation, showLowStockOnly]);

  // Table columns
  const columns = [
    {
      title: 'Item Details',
      key: 'details',
      render: (record: InventoryItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            SKU: {record.sku}
            {record.description && ` • ${record.description}`}
          </div>
          {record.fiberType && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.fiberType}
              {record.yarnCount && ` • ${record.yarnCount}`}
              {record.gsm && ` • ${record.gsm} GSM`}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (record: InventoryItem) => record.location.name,
    },
    {
      title: 'Stock Levels',
      key: 'stock',
      render: (record: InventoryItem) => (
        <div>
          <div>Current: {record.currentStock} {record.uom}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Available: {record.availableStock} {record.uom}
          </div>
          {record.currentStock <= record.minStockLevel && (
            <Tag color="red">Low Stock</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost: number) => `$${cost.toFixed(2)}`,
    },
    {
      title: 'Quality Status',
      dataIndex: 'qualityStatus',
      key: 'qualityStatus',
      render: (status: string) => (
        <Tag color={status === 'PASSED' ? 'green' : status === 'FAILED' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: InventoryItem) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditItem(record)}
            title="Edit Item"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            title="Delete Item"
          />
        </Space>
      ),
    },
  ];

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setCreateModalVisible(true);
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    form.resetFields();
    setCreateModalVisible(true);
  };

  const handleModalCancel = () => {
    setCreateModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values: any) => {
    try {
      const url = editingItem
        ? `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/inventory/items/${editingItem.id}`
        : `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/inventory/items`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(`Inventory item ${editingItem ? 'updated' : 'created'} successfully`);
        setCreateModalVisible(false);
        form.resetFields();
        loadInventoryData();
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to save inventory item');
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
      message.error('Failed to save inventory item');
    }
  };

  return (
    <MainLayout>
      <div className="inventory-root">
        <div className="inventory-header">
          <div className="inventory-title">
            <Heading level={1}>Inventory Management</Heading>
            <p className="inventory-subtitle">Manage your textile inventory and stock levels</p>
          </div>
          <div className="inventory-header-actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateItem}>
              Add Inventory Item
            </Button>
          </div>
        </div>

        <div className="inventory-content">

        {/* Summary Cards */}
        {summary && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Items"
                  value={summary.totalItems}
                  prefix={<BoxPlotOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Stock Value"
                  value={summary.totalStockValue}
                  prefix="$"
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Stock Qty"
                  value={summary.totalStockQuantity}
                  suffix="units"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title={
                    <Badge count={summary.lowStockItemsCount} showZero={false}>
                      Low Stock Alerts
                    </Badge>
                  }
                  value={summary.lowStockItemsCount}
                  prefix={<AlertOutlined />}
                  valueStyle={{ color: summary.lowStockItemsCount > 0 ? '#cf1322' : '#3f8600' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Alert
            message={`Low Stock Alert: ${lowStockItems.length} items need attention`}
            description="Items below minimum stock levels are highlighted in the table below."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Filters and Search */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search items..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by category"
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={setSelectedCategory}
                allowClear
              >
                <Option value="RAW_MATERIAL">Raw Material</Option>
                <Option value="WORK_IN_PROGRESS">Work in Progress</Option>
                <Option value="FINISHED_GOODS">Finished Goods</Option>
                <Option value="CONSUMABLES">Consumables</Option>
                <Option value="PACKAGING">Packaging</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type={showLowStockOnly ? 'primary' : 'default'}
                icon={<ExclamationCircleOutlined />}
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                block
              >
                {showLowStockOnly ? 'Show All Items' : 'Show Low Stock Only'}
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button onClick={loadInventoryData} block>
                Refresh Data
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Inventory Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={items}
            loading={loading}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        open={createModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Item Name"
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder="Cotton Fabric 200 GSM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true, message: 'Please enter SKU' }]}
              >
                <Input placeholder="COT-200-WHT-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="RAW_MATERIAL">Raw Material</Option>
                  <Option value="WORK_IN_PROGRESS">Work in Progress</Option>
                  <Option value="FINISHED_GOODS">Finished Goods</Option>
                  <Option value="CONSUMABLES">Consumables</Option>
                  <Option value="PACKAGING">Packaging</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="locationId"
                label="Location"
                rules={[{ required: true, message: 'Please select location' }]}
              >
                <Select placeholder="Select location">
                  {/* This would be populated from locations API */}
                  <Option value="default">Head Office</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Textile-specific fields */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="fiberType" label="Fiber Type">
                <Select placeholder="Select fiber type" allowClear>
                  <Option value="Cotton">Cotton</Option>
                  <Option value="Silk">Silk</Option>
                  <Option value="Wool">Wool</Option>
                  <Option value="Polyester">Polyester</Option>
                  <Option value="Nylon">Nylon</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="yarnCount" label="Yarn Count">
                <Input placeholder="Ne 30, Denier 75" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gsm" label="GSM">
                <InputNumber placeholder="200" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="fabricType" label="Fabric Type">
                <Select placeholder="Select fabric type" allowClear>
                  <Option value="Woven">Woven</Option>
                  <Option value="Knitted">Knitted</Option>
                  <Option value="Non-woven">Non-woven</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="color" label="Color">
                <Input placeholder="White, Navy, etc." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="width" label="Width (meters)">
                <InputNumber placeholder="1.5" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unitCost"
                label="Unit Cost"
                rules={[{ required: true, message: 'Please enter unit cost' }]}
              >
                <InputNumber
                  placeholder="25.50"
                  style={{ width: '100%' }}
                  prefix="$"
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="uom" label="Unit of Measure">
                <Select placeholder="Select UOM">
                  <Option value="METER">Meter</Option>
                  <Option value="KG">Kilogram</Option>
                  <Option value="PIECE">Piece</Option>
                  <Option value="ROLL">Roll</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="currentStock"
                label="Current Stock"
                rules={[{ required: true, message: 'Please enter current stock' }]}
              >
                <InputNumber placeholder="1000" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minStockLevel" label="Minimum Stock Level">
                <InputNumber placeholder="100" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="reorderPoint" label="Reorder Point">
                <InputNumber placeholder="200" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Additional item details..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={handleModalCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingItem ? 'Update Item' : 'Create Item'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </MainLayout>
  );
};

export default InventoryPage;
