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
  DatePicker,
  Divider,
  Alert
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { inventoryService, StockReservationRequest } from '../../services/inventoryService';
import { locationService } from '../../services/locationService';
import ProductSelector from '../products/ProductSelector';
import useAuth from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface Location {
  id: string;
  locationId: string;
  name: string;
  isDefault: boolean;
  isHeadquarters: boolean;
}

interface StockReservationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialProductId?: string;
  initialLocationId?: string;
  initialOrderId?: string;
}

const RESERVATION_TYPES = [
  {
    value: 'ORDER',
    label: 'Sales Order',
    description: 'Reserve stock for a customer order',
    color: '#1890ff',
    requiresOrderId: true
  },
  {
    value: 'PRODUCTION',
    label: 'Production',
    description: 'Reserve stock for production use',
    color: '#722ed1',
    requiresOrderId: false
  },
  {
    value: 'TRANSFER',
    label: 'Transfer',
    description: 'Reserve stock for location transfer',
    color: '#fa8c16',
    requiresOrderId: false
  },
  {
    value: 'MANUAL',
    label: 'Manual',
    description: 'Manual stock reservation',
    color: '#52c41a',
    requiresOrderId: false
  }
];

const StockReservationModal: React.FC<StockReservationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialProductId,
  initialLocationId,
  initialOrderId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedReservationType, setSelectedReservationType] = useState<string>();
  const { currentCompany } = useAuth();

  // Get reservation type config
  const reservationTypeConfig = RESERVATION_TYPES.find(type => type.value === selectedReservationType);

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
        locationId: initialLocationId,
        orderId: initialOrderId,
        reservationType: initialOrderId ? 'ORDER' : undefined,
      });
      
      if (initialOrderId) {
        setSelectedReservationType('ORDER');
      }
    }
  }, [visible, initialProductId, initialLocationId, initialOrderId, form]);

  // Handle reservation type change
  const handleReservationTypeChange = (value: string) => {
    setSelectedReservationType(value);
    const config = RESERVATION_TYPES.find(type => type.value === value);
    
    if (config && !config.requiresOrderId) {
      form.setFieldsValue({ orderId: undefined });
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const reservationData: StockReservationRequest = {
        productId: values.productId,
        locationId: values.locationId,
        orderId: values.orderId,
        reservedQuantity: values.reservedQuantity,
        reservationType: values.reservationType,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined,
        notes: values.notes,
      };

      const response = await inventoryService.createStockReservation(reservationData);

      if (response.success) {
        message.success('Stock reservation created successfully');
        form.resetFields();
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error creating stock reservation:', error);
      message.error(error instanceof Error ? error.message : 'Failed to create stock reservation');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.resetFields();
    setSelectedReservationType(undefined);
    onClose();
  };

  return (
    <Modal
      title="Create Stock Reservation"
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
          reservedQuantity: 1,
        }}
      >
        {/* Reservation Type Selection */}
        <Form.Item
          name="reservationType"
          label="Reservation Type"
          rules={[{ required: true, message: 'Please select reservation type' }]}
        >
          <Select
            placeholder="Select reservation type"
            onChange={handleReservationTypeChange}
            size="large"
          >
            {RESERVATION_TYPES.map(type => (
              <Option key={type.value} value={type.value}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOutlined style={{ color: type.color }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{type.label}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {type.description}
                    </div>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Reservation Type Info */}
        {reservationTypeConfig && (
          <Alert
            message={reservationTypeConfig.description}
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
            filterByStock={true}
          />
        </Form.Item>

        {/* Location Selection */}
        <Form.Item
          name="locationId"
          label="Location"
          rules={[{ required: true, message: 'Please select a location' }]}
        >
          <Select placeholder="Select location">
            {locations.map(location => (
              <Option key={location.id} value={location.id}>
                {location.name}
                {location.isHeadquarters && ' (HQ)'}
                {location.isDefault && ' (Default)'}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Order ID (if required) */}
        {reservationTypeConfig?.requiresOrderId && (
          <Form.Item
            name="orderId"
            label="Order ID"
            rules={[{ required: true, message: 'Please enter order ID' }]}
          >
            <Input placeholder="Enter order ID (e.g., SO001)" />
          </Form.Item>
        )}

        {/* Reserved Quantity */}
        <Form.Item
          name="reservedQuantity"
          label="Reserved Quantity"
          rules={[
            { required: true, message: 'Please enter reserved quantity' },
            { type: 'number', min: 0.001, message: 'Quantity must be greater than 0' }
          ]}
        >
          <InputNumber
            placeholder="Enter quantity to reserve"
            style={{ width: '100%' }}
            min={0.001}
            step={0.001}
            precision={3}
          />
        </Form.Item>

        {/* Expiry Date */}
        <Form.Item
          name="expiresAt"
          label="Expiry Date (Optional)"
          extra="Reservation will be automatically released after this date"
        >
          <DatePicker
            placeholder="Select expiry date"
            style={{ width: '100%' }}
            showTime
            format="YYYY-MM-DD HH:mm"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            suffixIcon={<CalendarOutlined />}
          />
        </Form.Item>

        {/* Notes */}
        <Form.Item
          name="notes"
          label="Notes (Optional)"
        >
          <TextArea
            placeholder="Enter additional notes about this reservation..."
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Important Notice */}
        <Alert
          message="Important"
          description="Reserved stock will be deducted from available inventory but not from total stock. The reservation can be released manually or will expire automatically if an expiry date is set."
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: '16px' }}
        />

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
              icon={<BookOutlined />}
            >
              Create Reservation
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockReservationModal;
