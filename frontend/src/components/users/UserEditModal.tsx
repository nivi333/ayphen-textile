import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Alert,
  Upload,
  Avatar,
  Row,
  Col,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { userService, User, UpdateUserRequest } from '../../services/userService';
import './UserEditModal.scss';

const { Option } = Select;

interface UserEditModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ visible, user, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roleChanged, setRoleChanged] = useState(false);
  const [originalRole, setOriginalRole] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user && visible) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        locationId: user.locationId,
        isActive: user.isActive,
      });
      setOriginalRole(user.role);
      setRoleChanged(false);
      setAvatarUrl(user.avatarUrl || '');
      setIsActive(user.isActive);
    }
  }, [user, visible, form]);

  const handleRoleChange = (newRole: string) => {
    setRoleChanged(newRole !== originalRole);
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG/WEBP files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = e => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return false; // Prevent automatic upload
  };

  const handleSubmit = async (values: any) => {
    if (!user) return;

    // Show confirmation if role is being changed
    if (roleChanged) {
      Modal.confirm({
        title: 'Confirm Role Change',
        content: `Are you sure you want to change ${user.firstName}'s role from ${originalRole} to ${values.role}? This will affect their permissions.`,
        okText: 'Yes, Change Role',
        cancelText: 'Cancel',
        onOk: async () => {
          await performUpdate(values);
        },
      });
    } else {
      await performUpdate(values);
    }
  };

  const performUpdate = async (values: any) => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData: UpdateUserRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        avatarUrl: avatarUrl || undefined,
        role: values.role,
        department: values.department,
        locationId: values.locationId,
        isActive: values.isActive,
      };

      await userService.updateUser(user.id, updateData);
      message.success('User updated successfully');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setRoleChanged(false);
    setAvatarUrl('');
    onClose();
  };

  return (
    <Modal
      title={`Edit User: ${user?.firstName} ${user?.lastName}`}
      open={visible}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      okText='Save Changes'
      cancelText='Cancel'
    >
      <div className='user-edit-modal'>
        <Form form={form} layout='vertical' onFinish={handleSubmit} className='user-form'>
          {/* Section 1: Personal Information */}
          <div className='form-section'>
            <h3 className='section-title'>Personal Information</h3>
            
            {/* Avatar Upload */}
            <div className='avatar-upload-container'>
              <Upload
                listType='picture-circle'
                showUploadList={false}
                beforeUpload={beforeUpload}
                className='user-avatar-upload'
              >
                {avatarUrl ? (
                  <Avatar size={100} src={avatarUrl} className='user-avatar' />
                ) : (
                  <div className='upload-placeholder'>
                    <UserOutlined style={{ fontSize: 24 }} />
                    <div style={{ marginTop: 8, fontSize: 12 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </div>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label='First Name'
                  name='firstName'
                  rules={[{ required: true, message: 'First name is required' }]}
                >
                  <Input placeholder='John' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label='Last Name'
                  name='lastName'
                  rules={[{ required: true, message: 'Last name is required' }]}
                >
                  <Input placeholder='Doe' />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 2: Contact Details */}
          <div className='form-section'>
            <h3 className='section-title'>Contact Details</h3>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label='Email'
                  name='email'
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Invalid email format' },
                  ]}
                >
                  <Input placeholder='user@example.com' />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item label='Phone' name='phone'>
                  <Input placeholder='+1234567890' />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 3: Role & Permissions */}
          <div className='form-section'>
            <h3 className='section-title'>Role & Permissions</h3>
            
            {roleChanged && (
              <Alert
                message='Role Change Warning'
                description="Changing the user's role will immediately affect their access permissions."
                type='warning'
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label='Role'
                  name='role'
                  rules={[{ required: true, message: 'Role is required' }]}
                >
                  <Select onChange={handleRoleChange} placeholder='Select role'>
                    <Option value='OWNER'>Owner</Option>
                    <Option value='ADMIN'>Admin</Option>
                    <Option value='MANAGER'>Manager</Option>
                    <Option value='EMPLOYEE'>Employee</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item label='Department' name='department'>
                  <Input placeholder='e.g., Production, Quality Control' />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item label='Location' name='locationId'>
                  <Select placeholder='Select location' allowClear>
                    <Option value=''>No specific location</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item name='isActive'>
                  <div className='active-toggle'>
                    <span className='toggle-label'>Active</span>
                    <Switch
                      checked={isActive}
                      onChange={checked => {
                        setIsActive(checked);
                        form.setFieldsValue({ isActive: checked });
                      }}
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default UserEditModal;
