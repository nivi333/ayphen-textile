import React, { useState } from 'react';
import { Modal, Form, InputNumber, Select, Input, message, Row, Col, Statistic } from 'antd';
import { GradientButton } from '../ui';
import { productService, ProductSummary, StockAdjustmentRequest } from '../../services/productService';
import useAuth from '../../contexts/AuthContext';
import './StockAdjustmentModal.scss';

const { Option } = Select;
const { TextArea } = Input;

interface StockAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdjusted: () => void;
  product: ProductSummary;
}

interface AdjustmentFormValues {
  adjustmentType: 'ADD' | 'REMOVE' | 'SET' | 'SALE' | 'PURCHASE' | 'RETURN' | 'DAMAGE' | 'TRANSFER';
  quantity: number;
  reason?: string;
  notes?: string;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  visible,
  onClose,
  onAdjusted,
  product,
}) => {
  const { user } = useAuth();
  const [form] = Form.useForm<AdjustmentFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<string>('ADD');
  const [quantity, setQuantity] = useState<number>(0);

  const calculateNewStock = () => {
    const currentStock = product.stockQuantity;
    const qty = quantity || 0;

    switch (adjustmentType) {
      case 'ADD':
      case 'PURCHASE':
      case 'RETURN':
        return currentStock + qty;
      case 'REMOVE':
      case 'SALE':
      case 'DAMAGE':
      case 'TRANSFER':
        return currentStock - qty;
      case 'SET':
        return qty;
      default:
        return currentStock;
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: StockAdjustmentRequest = {
        adjustmentType: values.adjustmentType,
        quantity: values.quantity,
        reason: values.reason,
        notes: values.notes,
        adjustedBy: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user?.email || 'Unknown',
      };

      await productService.adjustStock(product.id, payload);
      message.success('Stock adjusted successfully');
      
      onAdjusted();
      handleCancel();
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error(error.message || 'Failed to adjust stock');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAdjustmentType('ADD');
    setQuantity(0);
    onClose();
  };

  return (
    <Modal
      title='Adjust Stock'
      open={visible}
      onCancel={handleCancel}
      footer={[
        <button key='cancel' className='cancel-btn' onClick={handleCancel} disabled={submitting}>
          Cancel
        </button>,
        <GradientButton key='submit' onClick={handleSubmit} loading={submitting}>
          Adjust Stock
        </GradientButton>,
      ]}
      width={600}
    >
      <div className='stock-adjustment-modal'>
        {/* Current Stock Display */}
        <div className='current-stock-section'>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title='Current Stock'
                value={product.stockQuantity}
                suffix={product.unitOfMeasure}
                valueStyle={{ color: '#1a1a1a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title='New Stock'
                value={calculateNewStock()}
                suffix={product.unitOfMeasure}
                valueStyle={{ color: calculateNewStock() < 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title='Reorder Level'
                value={product.reorderLevel || 0}
                suffix={product.unitOfMeasure}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Col>
          </Row>
        </div>

        {/* Adjustment Form */}
        <Form
          form={form}
          layout='vertical'
          initialValues={{
            adjustmentType: 'ADD',
            quantity: 0,
          }}
          className='adjustment-form'
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='adjustmentType'
                label='Adjustment Type'
                rules={[{ required: true, message: 'Please select adjustment type' }]}
              >
                <Select
                  placeholder='Select type'
                  onChange={(value) => setAdjustmentType(value)}
                >
                  <Option value='ADD'>Add Stock</Option>
                  <Option value='REMOVE'>Remove Stock</Option>
                  <Option value='SET'>Set Stock Level</Option>
                  <Option value='PURCHASE'>Purchase</Option>
                  <Option value='SALE'>Sale</Option>
                  <Option value='RETURN'>Return</Option>
                  <Option value='DAMAGE'>Damage/Loss</Option>
                  <Option value='TRANSFER'>Transfer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='quantity'
                label='Quantity'
                rules={[
                  { required: true, message: 'Please enter quantity' },
                  {
                    validator: (_, value) => {
                      if (adjustmentType === 'SET') {
                        return value >= 0
                          ? Promise.resolve()
                          : Promise.reject(new Error('Quantity must be 0 or greater'));
                      }
                      return value > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error('Quantity must be greater than 0'));
                    },
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder='Enter quantity'
                  onChange={(value) => setQuantity(value || 0)}
                  suffix={product.unitOfMeasure}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name='reason' label='Reason'>
                <Input placeholder='e.g., New stock received, Damaged goods' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name='notes' label='Notes'>
                <TextArea rows={3} placeholder='Additional notes (optional)' />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Warning for negative stock */}
        {calculateNewStock() < 0 && (
          <div className='warning-message'>
            ⚠️ Warning: This adjustment will result in negative stock!
          </div>
        )}

        {/* Warning for low stock */}
        {product.reorderLevel && calculateNewStock() <= product.reorderLevel && calculateNewStock() >= 0 && (
          <div className='info-message'>
            ℹ️ Note: New stock level is at or below reorder level.
          </div>
        )}
      </div>
    </Modal>
  );
};
