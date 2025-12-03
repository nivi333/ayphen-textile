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
  App,
  Upload,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  yarnManufacturingService,
  YarnManufacturing,
  YARN_TYPES,
  YARN_PROCESSES,
  QUALITY_GRADES
} from '../../services/textileService';
import { GradientButton } from '../ui';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface YarnManufacturingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  yarnId?: string;
  initialData?: Partial<YarnManufacturing>;
}

export const YarnManufacturingDrawer: React.FC<YarnManufacturingDrawerProps> = ({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  yarnId,
  initialData,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');

  const isEditing = mode === 'edit' && !!yarnId;

  useEffect(() => {
    if (open) {
      if (isEditing && yarnId) {
        fetchYarnDetails(yarnId);
      } else if (initialData) {
        setFormData(initialData);
      } else {
        resetForm();
      }
    }
  }, [open, isEditing, yarnId, initialData]);

  const fetchYarnDetails = async (id: string) => {
    try {
      setLoading(true);
      const data = await yarnManufacturingService.getYarnManufacturingById(id);
      setFormData(data);
    } catch (error) {
      message.error('Failed to fetch yarn details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const setFormData = (data: any) => {
    form.setFieldsValue({
      ...data,
      productionDate: data.productionDate ? dayjs(data.productionDate) : undefined,
    });
    setIsActive(data.isActive ?? true);
    setImageUrl(data.imageUrl || '');
  };

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      productionDate: dayjs(),
      qualityGrade: 'A_GRADE',
      processType: 'SPINNING',
    });
    setIsActive(true);
    setImageUrl('');
  };

  const beforeUpload = (file: File) => {
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/svg+xml';
    if (!isValidType) {
      message.error('You can only upload JPG/PNG/SVG files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }

    const reader = new FileReader();
    reader.onload = e => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return false;
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload: any = {
        ...values,
        productionDate: values.productionDate.toISOString(),
        imageUrl: imageUrl || undefined,
      };

      if (isEditing && yarnId) {
        await yarnManufacturingService.updateYarnManufacturing(yarnId, payload);
        message.success('Yarn manufacturing record updated successfully');
      } else {
        await yarnManufacturingService.createYarnManufacturing(payload);
        message.success('Yarn manufacturing record created successfully');
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
          <span>{isEditing ? 'Edit Yarn Production' : 'New Yarn Production'}</span>
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
          initialValues={{ isActive: true }}
          className='ccd-form'
        >
          <Form.Item name='isActive' valuePropName='checked' hidden>
            <Switch />
          </Form.Item>

          <div className='ccd-form-content'>
            {/* Basic Information */}
            <div className='ccd-section'>
              <div className='ccd-section-header'>
                <div className='ccd-section-title'>Yarn Details</div>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label='Yarn Type'
                    name='yarnType'
                    rules={[{ required: true, message: 'Please select yarn type' }]}
                  >
                    <Select placeholder='Select type'>
                      {YARN_TYPES.map(type => (
                        <Option key={type.value} value={type.value}>{type.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Yarn Count'
                    name='yarnCount'
                    rules={[{ required: true, message: 'Please enter yarn count' }]}
                  >
                    <Input placeholder='e.g., 40s, 60s' />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label='Ply'
                    name='ply'
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder='e.g., 2' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Twist Per Inch'
                    name='twistPerInch'
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder='e.g., 15.5' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Color'
                    name='color'
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder='Color name/code' />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Production Details */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Production Details</div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label='Process Type'
                    name='processType'
                    rules={[{ required: true, message: 'Please select process' }]}
                  >
                    <Select placeholder='Select process'>
                      {YARN_PROCESSES.map(proc => (
                        <Option key={proc.value} value={proc.value}>{proc.label}</Option>
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
                    label='Quantity (Kg)'
                    name='quantityKg'
                    rules={[{ required: true, message: 'Please enter quantity' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      placeholder='Enter quantity in kg'
                      precision={2}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Production Date'
                    name='productionDate'
                    rules={[{ required: true, message: 'Please select date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label='Dye Lot'
                    name='dyeLot'
                  >
                    <Input placeholder='Optional dye lot number' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Quality Grade'
                    name='qualityGrade'
                    rules={[{ required: true, message: 'Please select grade' }]}
                  >
                    <Select placeholder='Select grade'>
                      {QUALITY_GRADES.map(grade => (
                        <Option key={grade.value} value={grade.value}>{grade.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Image Upload */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Product Image</div>
              <Row gutter={16}>
                <Col span={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Upload
                      name="image"
                      accept="image/png,image/jpeg,image/svg+xml"
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                    >
                      <Button icon={<UploadOutlined />}>Upload Image</Button>
                    </Upload>
                    {imageUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={imageUrl}
                          alt="Yarn"
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => setImageUrl('')}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                    Supported: PNG, JPG, SVG (max 2MB)
                  </div>
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
