import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  App,
  Row,
  Col,
  Divider,
  Upload,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { garmentManufacturingService, CreateGarmentManufacturingData, GARMENT_TYPES, PRODUCTION_STAGES } from '../../services/textileService';
import { GradientButton } from '../ui';
import dayjs from 'dayjs';
import '../CompanyCreationDrawer.scss';

const { Option } = Select;
const { TextArea } = Input;

interface GarmentManufacturingDrawerProps {
  visible: boolean;
  mode: 'create' | 'edit';
  garmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const GarmentManufacturingDrawer: React.FC<GarmentManufacturingDrawerProps> = ({
  visible,
  mode,
  garmentId,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');

  const isEditing = mode === 'edit';

  useEffect(() => {
    if (visible && mode === 'edit' && garmentId) {
      fetchGarmentDetails();
    } else if (visible && mode === 'create') {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        qualityPassed: false,
        defectCount: 0,
        productionStage: 'CUTTING',
      });
      setIsActive(true);
      setImageUrl('');
    }
  }, [visible, mode, garmentId]);

  const fetchGarmentDetails = async () => {
    if (!garmentId) return;
    
    setLoading(true);
    try {
      const garment = await garmentManufacturingService.getGarmentManufacturingById(garmentId);
      form.setFieldsValue({
        ...garment,
        cutDate: garment.cutDate ? dayjs(garment.cutDate) : undefined,
        sewDate: garment.sewDate ? dayjs(garment.sewDate) : undefined,
        finishDate: garment.finishDate ? dayjs(garment.finishDate) : undefined,
        packDate: garment.packDate ? dayjs(garment.packDate) : undefined,
      });
      setIsActive(garment.isActive ?? true);
      setImageUrl(garment.imageUrl || '');
    } catch (error) {
      console.error('Error fetching garment details:', error);
      message.error('Failed to load garment details');
    } finally {
      setLoading(false);
    }
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

  const handleClose = () => {
    form.resetFields();
    setImageUrl('');
    setIsActive(true);
    onClose();
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data: CreateGarmentManufacturingData = {
        garmentType: values.garmentType,
        styleNumber: values.styleNumber,
        size: values.size,
        color: values.color,
        fabricId: values.fabricId,
        quantity: values.quantity,
        productionStage: values.productionStage,
        cutDate: values.cutDate?.toISOString(),
        sewDate: values.sewDate?.toISOString(),
        finishDate: values.finishDate?.toISOString(),
        packDate: values.packDate?.toISOString(),
        operatorName: values.operatorName,
        lineNumber: values.lineNumber,
        qualityPassed: values.qualityPassed,
        defectCount: values.defectCount,
        locationId: values.locationId,
        notes: values.notes,
        isActive,
        imageUrl: imageUrl || undefined,
      };

      if (mode === 'create') {
        await garmentManufacturingService.createGarmentManufacturing(data);
        message.success('Garment record created successfully');
      } else if (garmentId) {
        await garmentManufacturingService.updateGarmentManufacturing(garmentId, data);
        message.success('Garment record updated successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving garment:', error);
      message.error('Failed to save garment record');
    } finally {
      setLoading(false);
    }
  };

  const drawerTitle = isEditing ? 'Edit Garment Record' : 'Add Garment Record';
  const submitLabel = isEditing ? 'Save Changes' : 'Create';

  return (
    <Drawer
      title={
        <div className='drawer-header-with-switch'>
          <span className='ccd-title'>{drawerTitle}</span>
          <div className='header-switch'>
            <span className='switch-label'>Active</span>
            <Switch
              checked={isActive}
              onChange={(checked) => {
                setIsActive(checked);
                form.setFieldsValue({ isActive: checked });
              }}
              disabled={!isEditing}
            />
          </div>
        </div>
      }
      width={720}
      onClose={handleClose}
      open={visible}
      className='company-creation-drawer'
      styles={{ body: { padding: 0 } }}
      footer={null}
    >
      <div className='ccd-content'>
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            qualityPassed: false,
            defectCount: 0,
            productionStage: 'CUTTING',
          }}
          className='ccd-form'
        >
          <Form.Item name='isActive' valuePropName='checked' hidden>
            <Switch />
          </Form.Item>
          <div className='ccd-form-content'>
            {/* Section 1: Basic Information */}
            <div className='ccd-section'>
              <div className='ccd-section-header'>
                <div className='ccd-section-title'>Basic Information</div>
              </div>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label='Garment Type'
                    name='garmentType'
                    rules={[{ required: true, message: 'Please select garment type' }]}
                  >
                    <Select placeholder='Select garment type' className='ccd-select'>
                      {GARMENT_TYPES.map(type => (
                        <Option key={type.value} value={type.value}>{type.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Style Number'
                    name='styleNumber'
                    rules={[{ required: true, message: 'Please enter style number' }]}
                  >
                    <Input
                      maxLength={32}
                      autoComplete='off'
                      placeholder='Enter style number'
                      className='ccd-input'
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label='Size'
                    name='size'
                    rules={[{ required: true, message: 'Please enter size' }]}
                  >
                    <Input
                      maxLength={16}
                      autoComplete='off'
                      placeholder='e.g., S, M, L, XL'
                      className='ccd-input'
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='Color'
                    name='color'
                    rules={[{ required: true, message: 'Please enter color' }]}
                  >
                    <Input
                      maxLength={32}
                      autoComplete='off'
                      placeholder='Enter color'
                      className='ccd-input'
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label='Quantity'
                    name='quantity'
                    rules={[{ required: true, message: 'Please enter quantity' }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder='Enter quantity'
                      className='ccd-input'
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Fabric ID' name='fabricId'>
                    <Input
                      maxLength={32}
                      autoComplete='off'
                      placeholder='Enter fabric ID (optional)'
                      className='ccd-input'
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Section 2: Production Details */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Production Details</div>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label='Production Stage'
                    name='productionStage'
                    rules={[{ required: true, message: 'Please select production stage' }]}
                  >
                    <Select placeholder='Select production stage' className='ccd-select'>
                      {PRODUCTION_STAGES.map(stage => (
                        <Option key={stage.value} value={stage.value}>{stage.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Line Number' name='lineNumber'>
                    <Input
                      maxLength={16}
                      autoComplete='off'
                      placeholder='Enter production line number'
                      className='ccd-input'
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label='Operator Name' name='operatorName'>
                    <Input
                      maxLength={64}
                      autoComplete='off'
                      placeholder='Enter operator name'
                      className='ccd-input'
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Section 3: Dates */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Production Dates</div>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label='Cut Date' name='cutDate'>
                    <DatePicker
                      placeholder='Select cut date'
                      className='ccd-input'
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Sew Date' name='sewDate'>
                    <DatePicker
                      placeholder='Select sew date'
                      className='ccd-input'
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label='Finish Date' name='finishDate'>
                    <DatePicker
                      placeholder='Select finish date'
                      className='ccd-input'
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Pack Date' name='packDate'>
                    <DatePicker
                      placeholder='Select pack date'
                      className='ccd-input'
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Section 4: Quality */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Quality Control</div>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label='Quality Passed' name='qualityPassed' valuePropName='checked'>
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Defect Count' name='defectCount'>
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      className='ccd-input'
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className='ccd-divider' />

            {/* Section 5: Product Image */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Product Image</div>
              <Row gutter={12}>
                <Col span={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Upload
                      name='image'
                      accept='image/png,image/jpeg,image/svg+xml'
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                    >
                      <Button icon={<UploadOutlined />}>Upload Image</Button>
                    </Upload>
                    {imageUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={imageUrl}
                          alt='Garment'
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Button
                          type='text'
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

            {/* Section 6: Additional Information */}
            <div className='ccd-section'>
              <div className='ccd-section-title'>Additional Information</div>
              <Row gutter={12}>
                <Col span={24}>
                  <Form.Item label='Notes' name='notes'>
                    <TextArea
                      rows={3}
                      maxLength={500}
                      autoComplete='off'
                      placeholder='Enter any additional notes...'
                      className='ccd-textarea'
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          <div className='ccd-actions'>
            <Button onClick={handleClose} className='ccd-cancel-btn'>
              Cancel
            </Button>
            <GradientButton size='small' htmlType='submit' loading={loading}>
              {submitLabel}
            </GradientButton>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default GarmentManufacturingDrawer;
