import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, DatePicker, Select, Button, Space, Divider, InputNumber, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { GradientButton } from '../ui';
import { locationService, Location } from '../../services/locationService';
import { orderService, CreateOrderRequest, OrderDetail, OrderItemInput } from '../../services/orderService';
import './OrderFormDrawer.scss';

const { Option } = Select;

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
      destroyOnClose
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
              <Space size='middle' style={{ width: '100%' }} direction='vertical'>
                <Form.Item
                  label='Customer Name'
                  name='customerName'
                  rules={[{ required: true, message: 'Please enter customer name' }]}
                >
                  <Input maxLength={255} placeholder='Enter customer name' />
                </Form.Item>

                <Form.Item label='Customer Code' name='customerCode'>
                  <Input maxLength={100} placeholder='Optional customer code' />
                </Form.Item>

                <Space size='middle' style={{ width: '100%' }}>
                  <Form.Item
                    label='Order Date'
                    name='orderDate'
                    rules={[{ required: true, message: 'Please select order date' }]}
                    style={{ flex: 1 }}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item label='Currency' name='currency' style={{ width: 160 }}>
                    <Input maxLength={10} placeholder='INR' />
                  </Form.Item>
                </Space>

                <Form.Item label='Notes' name='notes'>
                  <Input.TextArea rows={2} maxLength={1000} placeholder='Optional notes' />
                </Form.Item>

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
              </Space>
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
                      <div key={field.key} className='order-item-row'>
                        <Space align='start' style={{ width: '100%' }}>
                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Item Code' : ''}
                            name={[field.name, 'itemCode']}
                            fieldKey={[field.fieldKey!, 'itemCode']}
                            rules={[{ required: true, message: 'Item code is required' }]}
                            style={{ flex: 2 }}
                          >
                            <Input maxLength={255} placeholder='Item code' />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Description' : ''}
                            name={[field.name, 'description']}
                            fieldKey={[field.fieldKey!, 'description']}
                            style={{ flex: 3 }}
                          >
                            <Input maxLength={500} placeholder='Description (optional)' />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Qty' : ''}
                            name={[field.name, 'quantity']}
                            fieldKey={[field.fieldKey!, 'quantity']}
                            rules={[{ required: true, message: 'Quantity required' }]}
                            style={{ width: 100 }}
                          >
                            <InputNumber min={0.001} step={1} style={{ width: '100%' }} />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            label={index === 0 ? 'UOM' : ''}
                            name={[field.name, 'unitOfMeasure']}
                            fieldKey={[field.fieldKey!, 'unitOfMeasure']}
                            rules={[{ required: true, message: 'UOM required' }]}
                            style={{ width: 120 }}
                          >
                            <Input maxLength={50} placeholder='PCS' />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Unit Price' : ''}
                            name={[field.name, 'unitPrice']}
                            fieldKey={[field.fieldKey!, 'unitPrice']}
                            rules={[{ required: true, message: 'Unit price required' }]}
                            style={{ width: 140 }}
                          >
                            <InputNumber min={0} step={1} style={{ width: '100%' }} />
                          </Form.Item>

                          {fields.length > 1 && (
                            <Button
                              type='link'
                              danger
                              onClick={() => remove(field.name)}
                              style={{ marginTop: index === 0 ? 29 : 5 }}
                            >
                              Remove
                            </Button>
                          )}
                        </Space>
                      </div>
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
              <Space size='middle' style={{ width: '100%' }} direction='vertical'>
                <Space size='middle' style={{ width: '100%' }}>
                  <Form.Item label='Delivery Date' name='deliveryDate' style={{ flex: 1 }}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Space>

                <Space size='middle' style={{ width: '100%' }}>
                  <Form.Item label='Shipping Carrier' name='shippingCarrier' style={{ flex: 1 }}>
                    <Input maxLength={255} placeholder='e.g., FedEx, DHL' />
                  </Form.Item>

                  <Form.Item label='Tracking Number' name='trackingNumber' style={{ flex: 1 }}>
                    <Input maxLength={255} placeholder='Tracking number' />
                  </Form.Item>
                </Space>

                <Form.Item label='Shipping Method' name='shippingMethod'>
                  <Input maxLength={255} placeholder='e.g., Air, Sea, Road' />
                </Form.Item>

                <Space size='middle' style={{ width: '100%' }}>
                  <Form.Item label='Delivery Window Start' name='deliveryWindowStart' style={{ flex: 1 }}>
                    <DatePicker style={{ width: '100%' }} showTime />
                  </Form.Item>

                  <Form.Item label='Delivery Window End' name='deliveryWindowEnd' style={{ flex: 1 }}>
                    <DatePicker style={{ width: '100%' }} showTime />
                  </Form.Item>
                </Space>
              </Space>
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
