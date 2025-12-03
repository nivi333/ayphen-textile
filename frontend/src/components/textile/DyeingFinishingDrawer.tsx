import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Switch,
  Divider,
  Space,
  App,
  Checkbox,
} from 'antd';
import {
  dyeingFinishingService,
  DyeingFinishing,
  CreateDyeingFinishingData,
  DYEING_PROCESSES,
} from '../../services/textileService';
import { GradientButton } from '../ui';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface DyeingFinishingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  processId?: string;
  initialData?: Partial<DyeingFinishing>;
}

export const DyeingFinishingDrawer: React.FC<DyeingFinishingDrawerProps> = ({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  processId,
  initialData,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const isEditing = mode === 'edit' && !!processId;

  useEffect(() => {
    if (open) {
      if (isEditing && processId) {
        fetchProcessDetails(processId);
      } else if (initialData) {
        setFormData(initialData);
      } else {
        resetForm();
      }
    }
  }, [open, isEditing, processId, initialData]);

  const fetchProcessDetails = async (id: string) => {
    try {
      setLoading(true);
      const data = await dyeingFinishingService.getDyeingFinishingById(id);
      setFormData(data);
    } catch (error) {
      message.error('Failed to fetch process details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const setFormData = (data: any) => {
    form.setFieldsValue({
      ...data,
      processDate: data.processDate ? dayjs(data.processDate) : undefined,
    });
    setIsActive(data.isActive ?? true);
  };

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      processDate: dayjs(),
      processType: 'DYEING',
      qualityCheck: false,
    });
    setIsActive(true);
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload: any = {
        ...values,
        processDate: values.processDate.toISOString(),
      };

      if (isEditing && processId) {
        await dyeingFinishingService.updateDyeingFinishing(processId, payload);
        message.success('Process record updated successfully');
      } else {
        await dyeingFinishingService.createDyeingFinishing(payload);
        message.success('Process record created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={
        <div className='drawer-header-with-switch'>
          <span>{isEditing ? 'Edit Process' : 'New Dyeing/Finishing Process'}</span>
          <div className='header-switch'>
            <span className='switch-label'>Active</span>
            <Switch
              checked={isActive}
              onChange={(checked) => {
                setIsActive(checked);
                form.setFieldsValue({ isActive: checked });
              }}
            />
          </div>
        </div>
      }
      width={720}
      onClose={onClose}
      open={open}
      className='company-creation-drawer'
      styles={{ body: { padding: 0 } }}
      footer={null}
    >
      <div className='ccd-content'>
        <Form
          form={form}
          layout='vertical'
          onFinish={handleFinish}
          initialValues={{ isActive: true, qualityCheck: false }}
          className='ccd-form'
        >
          <Form.Item name='isActive' valuePropName='checked' hidden>
            <Switch />
          </Form.Item>

          <div className='ccd-form-content'>
            {/* Process Details */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Process Details</div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label='Process Type'
                    name='processType'
                    rules={[{ required: true, message: 'Please select process type' }]}
                  >
                    <Select placeholder='Select type'>
                      {DYEING_PROCESSES.map(type => (
                        <Option key={type.value} value={type.value}>{type.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Batch Number'
                    name='batchNumber'
                    rules={[{ required: true, message: 'Please enter batch number' }]}
                  >
                    <Input placeholder='Enter batch number' />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label='Process Date'
                    name='processDate'
                    rules={[{ required: true, message: 'Please select date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Machine Number'
                    name='machineNumber'
                  >
                    <Input placeholder='Optional machine ID' />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Color & Recipe */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Color & Recipe</div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label='Color Name'
                    name='colorName'
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder='e.g., Navy Blue' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Color Code'
                    name='colorCode'
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder='e.g., #000080 or Pantone' />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label='Recipe Code'
                    name='recipeCode'
                  >
                    <Input placeholder='Optional recipe ID' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Dye Method'
                    name='dyeMethod'
                  >
                    <Input placeholder='e.g., Reactive, Disperse' />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Technical Parameters */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Technical Parameters</div>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label='Quantity (Meters)'
                    name='quantityMeters'
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder='Meters' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Temperature (°C)'
                    name='temperatureC'
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder='Temp' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Duration (Min)'
                    name='durationMinutes'
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder='Minutes' />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label='Shrinkage (%)'
                    name='shrinkagePercent'
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder='%' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Color Fastness'
                    name='colorFastness'
                  >
                    <Input placeholder='e.g., 4-5' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Quality Check'
                    name='qualityCheck'
                    valuePropName='checked'
                  >
                    <Checkbox>Passed QC</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Additional Information */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Additional Information</div>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label='Notes' name='notes'>
                    <TextArea rows={3} placeholder='Any additional notes...' />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          <div className='ccd-actions'>
            <Button onClick={onClose} className='ccd-cancel-btn'>
              Cancel
            </Button>
            <GradientButton size='small' htmlType='submit' loading={loading}>
              {isEditing ? 'Save Changes' : 'Create Record'}
            </GradientButton>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};
