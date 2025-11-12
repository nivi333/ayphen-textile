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
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Tabs,
  Progress,
  Avatar,
  List,
  Checkbox,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import useAuth from '../contexts/AuthContext';
import { MainLayout } from '../components/layout';
import { Heading } from '../components/Heading';
import '../constants/company';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  productSku: string;
  category: string;
  fiberType?: string;
  yarnCount?: string;
  gsm?: number;
  fabricType?: string;
  color?: string;
  width?: number;
  orderedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  status: string;
  priority: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  qualityStatus: string;
  batchNumber?: string;
  lotNumber?: string;
  location: {
    id: string;
    name: string;
  };
  customer?: {
    id: string;
    name: string;
  };
  workOrders: WorkOrder[];
  qualityRecords: any[];
}

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  operationName: string;
  operationType: string;
  status: string;
  plannedQuantity: number;
  completedQuantity: number;
  rejectedQuantity: number;
  operatorId?: string;
  plannedStartTime?: string;
  actualStartTime?: string;
  plannedEndTime?: string;
  actualEndTime?: string;
  priority: string;
  qualityCheckRequired: boolean;
}

interface ProductionSummary {
  totalOrders: number;
  totalOrderedQuantity: number;
  totalProducedQuantity: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
}

const ProductionPage: React.FC = () => {
  const { currentCompany } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [workOrderModalVisible, setWorkOrderModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [workOrderForm] = Form.useForm();

  // Load production data
  const loadProductionData = async () => {
    if (!currentCompany) return;

    setLoading(true);
    try {
      // Load production orders
      const params = new URLSearchParams({
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedPriority && { priority: selectedPriority }),
        ...(searchText && { search: searchText }),
        ...(dateRange && {
          fromDate: dateRange[0].toISOString(),
          toDate: dateRange[1].toISOString(),
        }),
      });

      const ordersResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/production/orders?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.data || []);
      }

      // Load summary
      const summaryResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/production/summary`,
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
    } catch (error) {
      console.error('Error loading production data:', error);
      message.error('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductionData();
  }, [currentCompany, selectedStatus, selectedPriority, searchText, dateRange]);

  // Status and priority colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'default',
      CONFIRMED: 'blue',
      IN_PRODUCTION: 'orange',
      QUALITY_CHECK: 'purple',
      READY: 'cyan',
      SHIPPED: 'green',
      DELIVERED: 'green',
      CANCELLED: 'red',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'green',
      MEDIUM: 'blue',
      HIGH: 'orange',
      URGENT: 'red',
    };
    return colors[priority] || 'default';
  };

  // Table columns
  const columns = [
    {
      title: 'Order Details',
      key: 'details',
      render: (record: ProductionOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.orderNumber}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.productName} ({record.productSku})
          </div>
          {record.customer && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Customer: {record.customer.name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Product Specs',
      key: 'specs',
      render: (record: ProductionOrder) => (
        <div style={{ fontSize: '12px' }}>
          {record.fiberType && <div>{record.fiberType}</div>}
          {record.yarnCount && <div>{record.yarnCount}</div>}
          {record.gsm && <div>{record.gsm} GSM</div>}
          {record.color && <div>Color: {record.color}</div>}
        </div>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record: ProductionOrder) => {
        const progress = record.orderedQuantity > 0
          ? Math.round((record.producedQuantity / record.orderedQuantity) * 100)
          : 0;
        return (
          <div>
            <Progress
              percent={progress}
              size="small"
              status={record.rejectedQuantity > 0 ? 'exception' : 'active'}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
              {record.producedQuantity}/{record.orderedQuantity}
              {record.rejectedQuantity > 0 && (
                <span style={{ color: '#ff4d4f' }}> ({record.rejectedQuantity} rejected)</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (record: ProductionOrder) => (
        <div style={{ fontSize: '12px' }}>
          <div>Start: {record.plannedStartDate ? new Date(record.plannedStartDate).toLocaleDateString() : 'Not set'}</div>
          <div>End: {record.plannedEndDate ? new Date(record.plannedEndDate).toLocaleDateString() : 'Not set'}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: ProductionOrder) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => setSelectedOrder(record)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditOrder(record)}
            title="Edit Order"
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            size="small"
            onClick={() => handleCreateWorkOrder(record)}
            title="Manage Work Orders"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            title="Delete Order"
          />
        </Space>
      ),
    },
  ];

  const handleEditOrder = (order: ProductionOrder) => {
    setEditingOrder(order);
    form.setFieldsValue({
      ...order,
      plannedStartDate: order.plannedStartDate ? moment(order.plannedStartDate) : null,
      plannedEndDate: order.plannedEndDate ? moment(order.plannedEndDate) : null,
    });
    setCreateModalVisible(true);
  };

  const handleCreateWorkOrder = (order: ProductionOrder) => {
    setSelectedOrder(order);
    workOrderForm.resetFields();
    workOrderForm.setFieldsValue({
      productionOrderId: order.id,
      locationId: order.location.id,
    });
    setWorkOrderModalVisible(true);
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    form.resetFields();
    setCreateModalVisible(true);
  };

  const handleModalCancel = () => {
    setCreateModalVisible(false);
    setEditingOrder(null);
    form.resetFields();
  };

  const handleWorkOrderModalCancel = () => {
    setWorkOrderModalVisible(false);
    setSelectedOrder(null);
    workOrderForm.resetFields();
  };

  const handleFormSubmit = async (values: any) => {
    try {
      // Convert moment dates to ISO strings
      const processedValues = {
        ...values,
        plannedStartDate: values.plannedStartDate?.toISOString(),
        plannedEndDate: values.plannedEndDate?.toISOString(),
      };

      const url = editingOrder
        ? `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/production/orders/${editingOrder.id}`
        : `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/production/orders`;

      const method = editingOrder ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(processedValues),
      });

      if (response.ok) {
        message.success(`Production order ${editingOrder ? 'updated' : 'created'} successfully`);
        setCreateModalVisible(false);
        form.resetFields();
        loadProductionData();
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to save production order');
      }
    } catch (error) {
      console.error('Error saving production order:', error);
      message.error('Failed to save production order');
    }
  };

  const handleWorkOrderSubmit = async (values: any) => {
    try {
      const processedValues = {
        ...values,
        plannedStartTime: values.plannedStartTime?.toISOString(),
        plannedEndTime: values.plannedEndTime?.toISOString(),
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/production/work-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(processedValues),
      });

      if (response.ok) {
        message.success('Work order created successfully');
        setWorkOrderModalVisible(false);
        workOrderForm.resetFields();
        loadProductionData();
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to create work order');
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      message.error('Failed to create work order');
    }
  };

  return (
    <MainLayout>
      <div className="production-root">
        <div className="production-header">
          <div className="production-title">
            <Heading level={1}>Production Management</Heading>
            <p className="production-subtitle">Monitor and manage your textile production orders</p>
          </div>
          <div className="production-header-actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOrder}>
              Create Production Order
            </Button>
          </div>
        </div>

        <div className="production-content">

        {/* Summary Cards */}
        {summary && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={summary.totalOrders}
                  prefix={<SettingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="In Production"
                  value={summary.statusBreakdown.IN_PRODUCTION || 0}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Completed"
                  value={(summary.statusBreakdown.READY || 0) + (summary.statusBreakdown.SHIPPED || 0) + (summary.statusBreakdown.DELIVERED || 0)}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="High Priority"
                  value={summary.priorityBreakdown.HIGH || 0 + summary.priorityBreakdown.URGENT || 0}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters and Search */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search orders..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by status"
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={setSelectedStatus}
                allowClear
              >
                <Option value="DRAFT">Draft</Option>
                <Option value="CONFIRMED">Confirmed</Option>
                <Option value="IN_PRODUCTION">In Production</Option>
                <Option value="QUALITY_CHECK">Quality Check</Option>
                <Option value="READY">Ready</Option>
                <Option value="SHIPPED">Shipped</Option>
                <Option value="DELIVERED">Delivered</Option>
                <Option value="CANCELLED">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by priority"
                style={{ width: '100%' }}
                value={selectedPriority}
                onChange={setSelectedPriority}
                allowClear
              >
                <Option value="LOW">Low</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="HIGH">High</Option>
                <Option value="URGENT">Urgent</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                onChange={setDateRange}
                placeholder={['Start Date', 'End Date']}
              />
            </Col>
          </Row>
        </Card>

        {/* Production Orders Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} orders`,
            }}
            scroll={{ x: 1400 }}
          />
        </Card>
      </div>

      {/* Create/Edit Order Modal */}
      <Modal
        title={editingOrder ? 'Edit Production Order' : 'Create Production Order'}
        open={createModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderNumber"
                label="Order Number"
                rules={[{ required: true, message: 'Please enter order number' }]}
              >
                <Input placeholder="PO-2024-001" />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productName"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Cotton T-Shirt Fabric" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="productSku"
                label="Product SKU"
                rules={[{ required: true, message: 'Please enter product SKU' }]}
              >
                <Input placeholder="TSHIRT-COT-WHT-001" />
              </Form.Item>
            </Col>
          </Row>

          {/* Textile specifications */}
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
            <Col span={6}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="RAW_MATERIAL">Raw Material</Option>
                  <Option value="WORK_IN_PROGRESS">Work in Progress</Option>
                  <Option value="FINISHED_GOODS">Finished Goods</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="priority" label="Priority">
                <Select placeholder="Select priority">
                  <Option value="LOW">Low</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="HIGH">High</Option>
                  <Option value="URGENT">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="orderedQuantity"
                label="Ordered Quantity"
                rules={[{ required: true, message: 'Please enter ordered quantity' }]}
              >
                <InputNumber placeholder="1000" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
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
            <Col span={12}>
              <Form.Item name="plannedStartDate" label="Planned Start Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plannedEndDate" label="Planned End Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="estimatedCost" label="Estimated Cost">
                <InputNumber
                  placeholder="1500.00"
                  style={{ width: '100%' }}
                  prefix="$"
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerId" label="Customer">
                <Select placeholder="Select customer" allowClear>
                  {/* This would be populated from customers API */}
                  <Option value="customer1">Customer 1</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Additional order details..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={handleModalCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingOrder ? 'Update Order' : 'Create Order'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Work Order Modal */}
      <Modal
        title={`Create Work Order for ${selectedOrder?.orderNumber}`}
        open={workOrderModalVisible}
        onCancel={handleWorkOrderModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={workOrderForm}
          layout="vertical"
          onFinish={handleWorkOrderSubmit}
        >
          <Form.Item name="productionOrderId" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="locationId" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="workOrderNumber"
                label="Work Order Number"
                rules={[{ required: true, message: 'Please enter work order number' }]}
              >
                <Input placeholder="WO-2024-001-01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="operationName"
                label="Operation"
                rules={[{ required: true, message: 'Please select operation' }]}
              >
                <Select placeholder="Select operation">
                  <Option value="SPINNING">Spinning</Option>
                  <Option value="WEAVING">Weaving</Option>
                  <Option value="KNITTING">Knitting</Option>
                  <Option value="DYEING">Dyeing</Option>
                  <Option value="PRINTING">Printing</Option>
                  <Option value="FINISHING">Finishing</Option>
                  <Option value="CUTTING">Cutting</Option>
                  <Option value="SEWING">Sewing</Option>
                  <Option value="PACKAGING">Packaging</Option>
                  <Option value="QUALITY_CHECK">Quality Check</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plannedQuantity"
                label="Planned Quantity"
                rules={[{ required: true, message: 'Please enter planned quantity' }]}
              >
                <InputNumber placeholder="500" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select placeholder="Select priority">
                  <Option value="LOW">Low</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="HIGH">High</Option>
                  <Option value="URGENT">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="plannedStartTime" label="Planned Start Time">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plannedEndTime" label="Planned End Time">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="operatorId" label="Operator">
                <Select placeholder="Select operator" allowClear>
                  {/* This would be populated from users API */}
                  <Option value="user1">Operator 1</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="operationType" label="Operation Type">
                <Select placeholder="Select type">
                  <Option value="MANUAL">Manual</Option>
                  <Option value="MACHINE">Machine</Option>
                  <Option value="QUALITY_CHECK">Quality Check</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="qualityCheckRequired" valuePropName="checked">
            <Checkbox>Quality check required</Checkbox>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={2} placeholder="Work order instructions..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={handleWorkOrderModalCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Work Order
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          title={`Order Details - ${selectedOrder.orderNumber}`}
          open={!!selectedOrder}
          onCancel={() => setSelectedOrder(null)}
          footer={null}
          width={1000}
        >
          <Tabs defaultActiveKey="details">
            <TabPane tab="Order Details" key="details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="Product Information">
                    <p><strong>Product:</strong> {selectedOrder.productName}</p>
                    <p><strong>SKU:</strong> {selectedOrder.productSku}</p>
                    <p><strong>Category:</strong> {selectedOrder.category}</p>
                    {selectedOrder.fiberType && <p><strong>Fiber Type:</strong> {selectedOrder.fiberType}</p>}
                    {selectedOrder.yarnCount && <p><strong>Yarn Count:</strong> {selectedOrder.yarnCount}</p>}
                    {selectedOrder.gsm && <p><strong>GSM:</strong> {selectedOrder.gsm}</p>}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Production Progress">
                    <p><strong>Ordered:</strong> {selectedOrder.orderedQuantity}</p>
                    <p><strong>Produced:</strong> {selectedOrder.producedQuantity}</p>
                    <p><strong>Rejected:</strong> {selectedOrder.rejectedQuantity}</p>
                    <Progress
                      percent={Math.round((selectedOrder.producedQuantity / selectedOrder.orderedQuantity) * 100)}
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Work Orders" key="workorders">
              <List
                dataSource={selectedOrder.workOrders}
                renderItem={(workOrder: WorkOrder) => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">Edit</Button>,
                      <Button type="link" size="small" danger>Delete</Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<SettingOutlined />} />}
                      title={`${workOrder.workOrderNumber} - ${workOrder.operationName}`}
                      description={`Status: ${workOrder.status} | Planned: ${workOrder.plannedQuantity} | Completed: ${workOrder.completedQuantity}`}
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab="Quality Records" key="quality">
              <List
                dataSource={selectedOrder.qualityRecords}
                renderItem={(record: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<CheckCircleOutlined />} />}
                      title={`Quality Check - ${record.inspectionType}`}
                      description={`Status: ${record.status} | Score: ${record.qualityScore || 'N/A'}`}
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Modal>
      )}
      </div>
    </MainLayout>
  );
};

export default ProductionPage;
