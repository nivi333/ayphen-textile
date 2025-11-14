import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Alert,
  Upload,
  Avatar,
  message,
  Form,
  Row,
  Col,
  Divider,
} from 'antd';
import { EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { LOCATION_TYPE_LABELS, LOCATION_TYPE_COLORS } from '../../constants/location';
import { locationService, Location, CreateLocationRequest } from '../../services/locationService';
import { GradientButton } from '../ui';
import './LocationDrawer.scss';

interface LocationDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  editingLocation?: Location | null;
  locations: Location[];
}

const LocationDrawer: React.FC<LocationDrawerProps> = ({
  visible,
  onClose,
  onSave,
  editingLocation,
  locations,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [form] = Form.useForm();

  const watchedIsDefault = Form.useWatch('isDefault', form);
  const watchedIsHeadquarters = Form.useWatch('isHeadquarters', form);

  useEffect(() => {
    if (editingLocation) {
      form.setFieldsValue({
        name: editingLocation.name,
        email: editingLocation.email || '',
        phone: editingLocation.phone || '',
        country: editingLocation.country,
        addressLine1: editingLocation.addressLine1,
        addressLine2: editingLocation.addressLine2 || '',
        city: editingLocation.city,
        state: editingLocation.state,
        pincode: editingLocation.pincode,
        locationType: editingLocation.locationType,
        isDefault: editingLocation.isDefault,
        isHeadquarters: editingLocation.isHeadquarters,
      });
      if (editingLocation.imageUrl) {
        setImageUrl(editingLocation.imageUrl);
      }
    } else {
      form.resetFields();
      setImageUrl('');
    }
  }, [editingLocation, form]);

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
      return false;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = e => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return false; // Prevent automatic upload
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Validate business logic
      if (values.isDefault && !editingLocation) {
        const existingDefault = locations.find(loc => loc.isDefault);
        if (existingDefault) {
          message.error('Only one default location is allowed per company');
          return;
        }
      }

      if (values.isHeadquarters && !editingLocation) {
        const existingHeadquarters = locations.find(loc => loc.isHeadquarters);
        if (existingHeadquarters) {
          message.error('Only one headquarters location is allowed per company');
          return;
        }
      }

      const locationData: CreateLocationRequest = {
        ...values,
        imageUrl: imageUrl || undefined,
      };

      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, locationData);
        message.success('Location updated successfully');
      } else {
        await locationService.createLocation(locationData);
        message.success('Location created successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      message.error('Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (form.isFieldsTouched()) {
      // You could add a confirmation dialog here if needed
    }
    onClose();
  };

  return (
    <Drawer
      title={
        <div className='drawer-title'>
          <span>{editingLocation ? 'Edit Location' : 'Add New Location'}</span>
        </div>
      }
      placement='right'
      width={720}
      open={visible}
      onClose={handleCancel}
      className='location-drawer'
      footer={null}
    >
      <Form form={form} layout='vertical' onFinish={onFinish}>
        {/* Section 1: Basic Information */}
        <div className='ccd-section'>
          <div className='ccd-section-title'>Basic Information</div>
          <Col span={24}>
            <Upload
              name='avatar'
              listType='picture-circle'
              className='ccd-logo-upload'
              showUploadList={false}
              beforeUpload={beforeUpload}
            >
              {imageUrl ? (
                <Avatar size={120} src={imageUrl} />
              ) : (
                <span className='ccd-upload-icon'>
                  <EnvironmentOutlined />
                </span>
              )}
            </Upload>
            <div className='ccd-logo-help-text'>
              Upload Location Image (JPG/PNG, max 2MB)
              <br />
              Drag & drop or click to upload
            </div>
          </Col>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label='Location Name'
                name='name'
                rules={[{ required: true, message: 'Please enter location name' }]}
              >
                <Input
                  maxLength={100}
                  autoComplete='off'
                  placeholder='Enter location name'
                  className='ccd-input'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Email Address'
                name='email'
                rules={[
                  {
                    type: 'email',
                    message: 'Please enter a valid email address',
                  },
                ]}
              >
                <Input
                  autoComplete='off'
                  placeholder='location@company.com'
                  className='ccd-input'
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label='Phone Number' name='phone'>
                <Input autoComplete='off' placeholder='+1 234 567 8900' className='ccd-input' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Location Type'
                name='locationType'
                rules={[{ required: true, message: 'Please select location type' }]}
              >
                <Select placeholder='Select location type' className='ccd-select'>
                  {Object.entries(LOCATION_TYPE_LABELS).map(
                    ([key, label]) =>
                      key !== 'HEADQUARTERS' && (
                        <Select.Option key={key} value={key}>
                          <Space>
                            <div
                              className='type-indicator'
                              style={{
                                backgroundColor:
                                  LOCATION_TYPE_COLORS[key as keyof typeof LOCATION_TYPE_COLORS],
                              }}
                            />
                            {label}
                          </Space>
                        </Select.Option>
                      )
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Country'
                name='country'
                rules={[{ required: true, message: 'Please enter country' }]}
              >
                <Input autoComplete='off' placeholder='Enter country' className='ccd-input' />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider className='ccd-divider' />

        {/* Section 2: Address Information */}
        <div className='ccd-section'>
          <div className='ccd-section-title'>Address Information</div>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label='Address Line 1'
                name='addressLine1'
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input
                  maxLength={255}
                  autoComplete='off'
                  placeholder='Street address'
                  className='ccd-input'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Address Line 2' name='addressLine2'>
                <Input
                  maxLength={255}
                  autoComplete='off'
                  placeholder='Apartment, suite, unit, building, floor, etc.'
                  className='ccd-input'
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label='City'
                name='city'
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input
                  maxLength={100}
                  autoComplete='off'
                  placeholder='Enter city'
                  className='ccd-input'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='State/Province'
                name='state'
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input
                  maxLength={100}
                  autoComplete='off'
                  placeholder='Enter state'
                  className='ccd-input'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Postal/ZIP Code'
                name='pincode'
                rules={[{ required: true, message: 'Please enter postal code' }]}
              >
                <Input
                  maxLength={20}
                  autoComplete='off'
                  placeholder='Enter postal code'
                  className='ccd-input'
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider className='ccd-divider' />

        {/* Section 3: Location Settings */}
        <div className='ccd-section'>
          <div className='ccd-section-title'>Location Settings</div>
          <Form.Item label='Default Location' name='isDefault' valuePropName='checked'>
            <div className='switch-field'>
              <Switch />
              <div className='switch-label'></div>
            </div>
          </Form.Item>

          <Form.Item label='Headquarters' name='isHeadquarters' valuePropName='checked'>
            <div className='switch-field'>
              <Switch />
              <div className='switch-label'></div>
            </div>
          </Form.Item>

          {(watchedIsDefault || watchedIsHeadquarters) && (
            <Alert
              message='Special Location'
              description={
                watchedIsHeadquarters
                  ? 'This location will be marked as the company headquarters.'
                  : 'This location will be used as the default for company operations.'
              }
              type='info'
              showIcon
              icon={<InfoCircleOutlined />}
              className='info-alert'
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className='ccd-actions'>
          <Button onClick={handleCancel} className='ccd-cancel-btn'>
            Cancel
          </Button>
          <GradientButton size='small' htmlType='submit' loading={loading}>
            {editingLocation ? 'Update Location' : 'Create Location'}
          </GradientButton>
        </div>
      </Form>
    </Drawer>
  );
};

export default LocationDrawer;
