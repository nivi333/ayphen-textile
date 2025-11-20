import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, DatePicker, Select, Button, Divider, InputNumber, message, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { GradientButton } from '../ui';
import { locationService, Location } from '../../services/locationService';
import { orderService, CreateOrderRequest, OrderDetail, OrderItemInput } from '../../services/orderService';
import './OrderFormDrawer.scss';

const { Option } = Select;

// UOM (Unit of Measure) options for textile manufacturing
// Common units used in textile industry for measuring quantities
const UOM_OPTIONS = [
  { value: 'PCS', label: 'PCS - Pieces' },
  { value: 'MTR', label: 'MTR - Meters' },
  { value: 'YDS', label: 'YDS - Yards' },
  { value: 'KG', label: 'KG - Kilograms' },
  { value: 'LBS', label: 'LBS - Pounds' },
  { value: 'ROLL', label: 'ROLL - Rolls' },
  { value: 'BOX', label: 'BOX - Boxes' },
  { value: 'CTN', label: 'CTN - Cartons' },
  { value: 'DOZ', label: 'DOZ - Dozens' },
  { value: 'SET', label: 'SET - Sets' },
  { value: 'BALE', label: 'BALE - Bales' },
  { value: 'CONE', label: 'CONE - Cones' },
  { value: 'SPOOL', label: 'SPOOL - Spools' },
];

interface OrderFormDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode?: 'create' | 'edit';
  editingOrderId?: string | null;
}

interface OrderFormValues {
  customerName: string;
  customerCode?: string;
  orderDate: Dayjs;
  deliveryDate?: Dayjs;
  currency?: string;
  notes?: string;
  locationId?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  deliveryWindowStart?: Dayjs;
  deliveryWindowEnd?: Dayjs;
  items: {
    itemCode: string;
    description?: string;
    quantity: number;
    unitOfMeasure: string;
    unitPrice: number;
  }[];
}

export const OrderFormDrawer: React.FC<OrderFormDrawerProps> = ({
  visible,
  onClose,
  onSaved,
  mode = 'create',
  editingOrderId,
}) => {
  const [form] = Form.useForm<OrderFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const isEditing = mode === 'edit' && !!editingOrderId;

  useEffect(() => {
    if (!visible) return;

    const loadData = async () => {
      try {
        const [locs, order] = await Promise.all([
          locationService.getLocations(),
          isEditing && editingOrderId ? orderService.getOrderById(editingOrderId) : Promise.resolve(null),
        ]);

        setLocations(locs);

        if (order) {
          populateForm(order);
        } else {
          form.resetFields();
          form.setFieldsValue({
            currency: 'INR',
            orderDate: dayjs(),
            items: [
              {
                itemCode: '',
                description: '',
                quantity: 1,
                unitOfMeasure: 'PCS',
                unitPrice: 0,
              },
            ],
          } as any);
        }
      } catch (error: any) {
        console.error('Error initializing order form:', error);
        message.error(error.message || 'Failed to initialize order form');
      }
    };

    loadData();
  }, [visible, isEditing, editingOrderId, form]);

  const populateForm = (order: OrderDetail) => {
    form.setFieldsValue({
      customerName: order.customerName,
      customerCode: order.customerCode,
      orderDate: dayjs(order.orderDate),
      deliveryDate: order.deliveryDate ? dayjs(order.deliveryDate) : undefined,
      currency: order.currency,
      notes: order.notes,
      locationId: order.locationId,
      shippingCarrier: order.shippingCarrier,
      trackingNumber: order.trackingNumber,
      shippingMethod: order.shippingMethod,
      deliveryWindowStart: order.deliveryWindowStart ? dayjs(order.deliveryWindowStart) : undefined,
      deliveryWindowEnd: order.deliveryWindowEnd ? dayjs(order.deliveryWindowEnd) : undefined,
      items: order.items.map(item => ({
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        unitPrice: item.unitPrice,
      })),
    } as any);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const buildPayload = (values: OrderFormValues): CreateOrderRequest => {
    const items: OrderItemInput[] = values.items.map(item => ({
      itemCode: item.itemCode,
      description: item.description,
      quantity: item.quantity,
      unitOfMeasure: item.unitOfMeasure,
      unitPrice: item.unitPrice,
    }));

    return {
      customerName: values.customerName,
      customerCode: values.customerCode || undefined,
      orderDate: values.orderDate.toISOString(),
      deliveryDate: values.deliveryDate ? values.deliveryDate.toISOString() : undefined,
      currency: values.currency || 'INR',
      notes: values.notes || undefined,
      locationId: values.locationId || undefined,
      shippingCarrier: values.shippingCarrier || undefined,
      trackingNumber: values.trackingNumber || undefined,
      shippingMethod: values.shippingMethod || undefined,
      deliveryWindowStart: values.deliveryWindowStart
        ? values.deliveryWindowStart.toISOString()
        : undefined,
      deliveryWindowEnd: values.deliveryWindowEnd ? values.deliveryWindowEnd.toISOString() : undefined,
      items,
    };
  };

  const handleSubmit = async (values: OrderFormValues) => {
    try {
      setSubmitting(true);
      const payload = buildPayload(values);

      if (isEditing && editingOrderId) {
        await orderService.updateOrder(editingOrderId, payload);
        message.success('Order updated successfully');
      } else {
        await orderService.createOrder(payload);
        message.success('Order created successfully');
      }

      onSaved();
      handleClose();
    } catch (error: any) {
      console.error('Error saving order:', error);
      message.error(error.message || 'Failed to save order');
    } finally {
      setSubmitting(false);
    }
  };

  const drawerTitle = isEditing ? 'Edit Order' : 'Create Order';
  const submitLabel = isEditing ? 'Update Order' : 'Create Order';

  return (
    <Drawer
      title={<span className='order-drawer-title'>{drawerTitle}</span>}
      width={720}
      onClose={handleClose}
      open={visible}
      className='order-form-drawer'
      styles={{ body: { padding: 0 } }}
      footer={null}
    >
      <div className='order-drawer-content'>
        <Form<OrderFormValues>
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          className='order-form'
        >
          <div className='order-form-content'>
            {/* Order Info */}
            <div className='order-section'>
              <div className='order-section-title'>Order Info</div>
              <Row gutter={[5, 10]}>
                <Col span={12}>
                  <Form.Item
                    label='Customer Name'
                    name='customerName'
                    rules={[{ required: true, message: 'Please enter customer name' }]}
                  >
                    <Input maxLength={255} placeholder='Enter customer name' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Customer Code' name='customerCode'>
                    <Input maxLength={100} placeholder='Optional customer code' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Order Date'
                    name='orderDate'
                    rules={[{ required: true, message: 'Please select order date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Currency' name='currency'>
                    <Input maxLength={10} placeholder='INR' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label='Notes' name='notes'>
                    <Input.TextArea rows={2} maxLength={1000} placeholder='Optional notes' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label='Location' name='locationId'>
                    <Select
                      allowClear
                      placeholder='Select shipping location'
                      showSearch
                      optionFilterProp='children'
                    >
                      {locations.map(loc => (
                        <Option key={loc.id} value={loc.id}>
                          {loc.name}
                          {loc.isHeadquarters ? ' • HQ' : ''}
                          {loc.isDefault ? ' • Default' : ''}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='order-divider' />

            {/* Items */}
            <div className='order-section'>
              <div className='order-section-title'>Items</div>

              <Form.List
                name='items'
                rules={[
                  {
                    validator: async (_, items) => {
                      if (!items || items.length === 0) {
                        return Promise.reject(new Error('At least one item is required'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map((field, index) => (
                      <Row key={field.key} gutter={[5, 10]} className='order-item-row' align='top'>
                        <Col span={4}>
                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Item Code' : ''}
                            name={[field.name, 'itemCode']}
                            fieldKey={[field.fieldKey!, 'itemCode']}
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input maxLength={255} placeholder='Item code' />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Description' : ''}
                            name={[field.name, 'description']}
                            fieldKey={[field.fieldKey!, 'description']}
                          >
                            <Input maxLength={500} placeholder='Description (optional)' />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Qty' : ''}
                            name={[field.name, 'quantity']}
                            fieldKey={[field.fieldKey!, 'quantity']}
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <InputNumber min={0.001} step={1} style={{ width: '100%' }} placeholder='1' />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...field}
                            label={index === 0 ? 'UOM' : ''}
                            name={[field.name, 'unitOfMeasure']}
                            fieldKey={[field.fieldKey!, 'unitOfMeasure']}
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Select placeholder='Select UOM' showSearch>
                              {UOM_OPTIONS.map(uom => (
                                <Option key={uom.value} value={uom.value}>
                                  {uom.label}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Unit Price' : ''}
                            name={[field.name, 'unitPrice']}
                            fieldKey={[field.fieldKey!, 'unitPrice']}
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <InputNumber
                              min={0}
                              step={0.01}
                              precision={2}
                              style={{ width: '100%' }}
                              placeholder='0.00'
                              formatter={(value) => {
                                if (!value) return '';
                                return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                              }}
                              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          {fields.length > 1 && (
                            <Button
                              type='text'
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(field.name)}
                              style={{ marginTop: index === 0 ? 30 : 6 }}
                            />
                          )}
                        </Col>
                      </Row>
                    ))}

                    <Form.ErrorList errors={errors} />

                    <Button type='dashed' onClick={() => add()} block style={{ marginTop: 8 }}>
                      Add Item
                    </Button>
                  </>
                )}
              </Form.List>
            </div>

            <Divider className='order-divider' />

            {/* Delivery Details */}
            <div className='order-section'>
              <div className='order-section-title'>Delivery Details</div>
              <Row gutter={[5, 10]}>
                <Col span={12}>
                  <Form.Item label='Delivery Date' name='deliveryDate'>
                    <DatePicker style={{ width: '100%' }} placeholder='Select date' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Shipping Method' name='shippingMethod'>
                    <Input maxLength={255} placeholder='e.g., Air, Sea, Road' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Shipping Carrier' name='shippingCarrier'>
                    <Input maxLength={255} placeholder='e.g., FedEx, DHL' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Tracking Number' name='trackingNumber'>
                    <Input maxLength={255} placeholder='Tracking number' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Delivery Window Start' name='deliveryWindowStart'>
                    <DatePicker style={{ width: '100%' }} showTime placeholder='Start date & time' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Delivery Window End' name='deliveryWindowEnd'>
                    <DatePicker style={{ width: '100%' }} showTime placeholder='End date & time' />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          <div className='order-actions'>
            <Button onClick={handleClose} className='order-cancel-btn'>
              Cancel
            </Button>
            <GradientButton size='small' htmlType='submit' loading={submitting}>
              {submitLabel}
            </GradientButton>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};
