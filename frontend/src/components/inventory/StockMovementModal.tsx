import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  Button,
  Space,
  message,
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import {
  SwapOutlined,
  PlusOutlined,
  MinusOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { inventoryService, StockMovementRequest } from '../../services/inventoryService';
import { locationService } from '../../services/locationService';
import ProductSelector from '../products/ProductSelector';
import useAuth from '../../contexts/AuthContext';

const { Option } = Select;
const { TextArea } = Input;

interface Location {
  id: string;
  locationId: string;
  name: string;
  isDefault: boolean;
  isHeadquarters: boolean;
}

interface StockMovementModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialProductId?: string;
  initialLocationId?: string;
}

const MOVEMENT_TYPES = [
  {
    value: 'PURCHASE',
    label: 'Purchase',
    icon: <PlusOutlined />,
    description: 'Stock received from supplier',
    requiresTo: true,
    requiresFrom: false,
    color: '#52c41a'
  },
  {
    value: 'SALE',
    label: 'Sale',
    icon: <MinusOutlined />,
    description: 'Stock sold to customer',
    requiresTo: false,
    requiresFrom: true,
    color: '#ff4d4f'
  },
  {
    value: 'TRANSFER_IN',
    label: 'Transfer In',
    icon: <SwapOutlined />,
    description: 'Stock transferred from another location',
    requiresTo: true,
    requiresFrom: true,
    color: '#1890ff'
  },
  {
    value: 'TRANSFER_OUT',
    label: 'Transfer Out',
    icon: <SwapOutlined />,
    description: 'Stock transferred to another location',
    requiresTo: true,
    requiresFrom: true,
    color: '#fa8c16'
  },
  {
    value: 'ADJUSTMENT_IN',
    label: 'Adjustment In',
    icon: <PlusOutlined />,
    description: 'Stock increase adjustment',
    requiresTo: true,
    requiresFrom: false,
    color: '#52c41a'
  },
  {
    value: 'ADJUSTMENT_OUT',
    label: 'Adjustment Out',
    icon: <MinusOutlined />,
    description: 'Stock decrease adjustment',
    requiresTo: false,
    requiresFrom: true,
    color: '#ff4d4f'
  },
  {
    value: 'PRODUCTION_IN',
    label: 'Production In',
    icon: <ToolOutlined />,
    description: 'Stock produced/manufactured',
    requiresTo: true,
    requiresFrom: false,
    color: '#722ed1'
  },
  {
    value: 'PRODUCTION_OUT',
    label: 'Production Out',
    icon: <ToolOutlined />,
    description: 'Stock consumed in production',
    requiresTo: false,
    requiresFrom: true,
    color: '#eb2f96'
  },
  {
    value: 'RETURN_IN',
    label: 'Return In',
    icon: <PlusOutlined />,
    description: 'Stock returned from customer',
    requiresTo: true,
    requiresFrom: false,
    color: '#13c2c2'
  },
  {
    value: 'RETURN_OUT',
    label: 'Return Out',
    icon: <MinusOutlined />,
    description: 'Stock returned to supplier',
    requiresTo: false,
    requiresFrom: true,
    color: '#fa541c'
  },
  {
    value: 'DAMAGE',
    label: 'Damage/Loss',
    icon: <MinusOutlined />,
    description: 'Stock damaged or lost',
    requiresTo: false,
    requiresFrom: true,
    color: '#f5222d'
  }
];

const StockMovementModal: React.FC<StockMovementModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialProductId,
  initialLocationId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedMovementType, setSelectedMovementType] = useState<string>();
  const { currentCompany } = useAuth();

  // Get movement type config
  const movementTypeConfig = MOVEMENT_TYPES.find(type => type.value === selectedMovementType);

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

    if (visible) {
      fetchLocations();
    }
  }, [visible, currentCompany?.id]);

  // Set initial values
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        productId: initialProductId,
        fromLocationId: initialLocationId,
        toLocationId: initialLocationId,
      });
    }
  }, [visible, initialProductId, initialLocationId, form]);

  // Handle movement type change
  const handleMovementTypeChange = (value: string) => {
    setSelectedMovementType(value);
    const config = MOVEMENT_TYPES.find(type => type.value === value);
    
    if (config) {
      // Clear location fields that are not required
      const updates: any = {};
      if (!config.requiresFrom) {
        updates.fromLocationId = undefined;
      }
      if (!config.requiresTo) {
        updates.toLocationId = undefined;
      }
      form.setFieldsValue(updates);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const movementData: StockMovementRequest = {
        productId: values.productId,
        fromLocationId: values.fromLocationId,
        toLocationId: values.toLocationId,
        movementType: values.movementType,
        quantity: values.quantity,
        unitCost: values.unitCost,
        referenceType: values.referenceType,
        referenceId: values.referenceId,
        notes: values.notes,
      };

      const response = await inventoryService.recordStockMovement(movementData);

      if (response.success) {
        message.success('Stock movement recorded successfully');
        form.resetFields();
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error recording stock movement:', error);
      message.error(error instanceof Error ? error.message : 'Failed to record stock movement');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.resetFields();
    setSelectedMovementType(undefined);
    onClose();
  };

  return (
    <Modal
      title="Record Stock Movement"
      open={visible}
      onCancel={handleClose}
      width={600}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quantity: 1,
        }}
      >
        {/* Movement Type Selection */}
        <Form.Item
          name="movementType"
          label="Movement Type"
          rules={[{ required: true, message: 'Please select movement type' }]}
        >
          <Select
            placeholder="Select movement type"
            onChange={handleMovementTypeChange}
            size="large"
            optionLabelProp="label"
          >
            {MOVEMENT_TYPES.map(type => (
              <Option key={type.value} value={type.value} label={type.label}>
                <Space align="start" style={{ width: '100%' }}>
                  <span style={{ color: type.color, marginTop: '2px' }}>{type.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{type.label}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {type.description}
                    </div>
                  </div>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Movement Type Info */}
        {movementTypeConfig && (
          <Alert
            message={movementTypeConfig.description}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        {/* Product Selection */}
        <Form.Item
          name="productId"
          label="Product"
          rules={[{ required: true, message: 'Please select a product' }]}
        >
          <ProductSelector
            placeholder="Select product"
            showStockInfo={true}
            filterByActive={true}
          />
        </Form.Item>

        {/* Location Fields */}
        <Row gutter={16}>
          {movementTypeConfig?.requiresFrom && (
            <Col span={12}>
              <Form.Item
                name="fromLocationId"
                label="From Location"
                rules={[{ required: true, message: 'Please select from location' }]}
              >
                <Select placeholder="Select from location">
                  {locations.map(location => (
                    <Option key={location.id} value={location.id}>
                      {location.name}
                      {location.isHeadquarters && ' (HQ)'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}

          {movementTypeConfig?.requiresTo && (
            <Col span={movementTypeConfig?.requiresFrom ? 12 : 24}>
              <Form.Item
                name="toLocationId"
                label="To Location"
                rules={[{ required: true, message: 'Please select to location' }]}
              >
                <Select placeholder="Select to location">
                  {locations.map(location => (
                    <Option key={location.id} value={location.id}>
                      {location.name}
                      {location.isHeadquarters && ' (HQ)'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        {/* Quantity and Cost */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                { required: true, message: 'Please enter quantity' },
                { type: 'number', min: 0.001, message: 'Quantity must be greater than 0' }
              ]}
            >
              <InputNumber
                placeholder="Enter quantity"
                style={{ width: '100%' }}
                min={0.001}
                step={0.001}
                precision={3}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="unitCost"
              label="Unit Cost (Optional)"
            >
              <InputNumber
                placeholder="Enter unit cost"
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                precision={2}
                prefix="₹"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Reference Information */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="referenceType"
              label="Reference Type (Optional)"
            >
              <Select placeholder="Select reference type" allowClear>
                <Option value="PURCHASE_ORDER">Purchase Order</Option>
                <Option value="SALES_ORDER">Sales Order</Option>
                <Option value="TRANSFER">Transfer</Option>
                <Option value="PRODUCTION_ORDER">Production Order</Option>
                <Option value="RETURN">Return</Option>
                <Option value="ADJUSTMENT">Adjustment</Option>
                <Option value="OTHER">Other</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="referenceId"
              label="Reference ID (Optional)"
            >
              <Input placeholder="Enter reference ID" />
            </Form.Item>
          </Col>
        </Row>

        {/* Notes */}
        <Form.Item
          name="notes"
          label="Notes (Optional)"
        >
          <TextArea
            placeholder="Enter additional notes..."
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Divider />

        {/* Form Actions */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SwapOutlined />}
            >
              Record Movement
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockMovementModal;
