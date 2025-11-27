import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Spin,
  message,
  Avatar,
  Divider,
  Row,
  Col,
  Upload,
  Switch,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  CameraOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { MainLayout } from '../../components/layout';
import { Heading } from '../../components/Heading';
import { GradientButton } from '../../components/ui';
import useAuth from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import './UserProfilePage.scss';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || '',
      });
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Call API to update user profile
      await userService.updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
      });

      message.success('Profile updated successfully');
      setEditMode(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      // Get this url from response in real world
      setAvatarUrl(info.file.response.url);
      message.success('Avatar uploaded successfully');
    } else if (info.file.status === 'error') {
      message.error('Avatar upload failed');
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!currentUser) {
    return (
      <MainLayout>
        <div className='user-profile-page loading'>
          <Spin size='large' />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className='page-container'>
        <div className='page-header-section'>
          <Heading level={2} className='page-title'>
            My Profile
          </Heading>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className='profile-avatar-card'>
              <div className='avatar-section'>
                <Upload
                  name='avatar'
                  showUploadList={false}
                  action='/api/v1/users/avatar'
                  onChange={handleAvatarChange}
                  disabled={!editMode}
                >
                  <div className='avatar-wrapper'>
                    <Avatar
                      size={120}
                      src={avatarUrl}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: '#7b5fc9',
                        cursor: editMode ? 'pointer' : 'default',
                      }}
                    >
                      {!avatarUrl && getInitials(currentUser.firstName, currentUser.lastName)}
                    </Avatar>
                    {editMode && (
                      <div className='avatar-overlay'>
                        <CameraOutlined style={{ fontSize: 24, color: '#fff' }} />
                      </div>
                    )}
                  </div>
                </Upload>
                <h2 style={{ marginTop: 16, marginBottom: 8 }}>
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
                <p style={{ color: '#666', marginBottom: 0 }}>{currentUser.email}</p>
              </div>

              <Divider />

              <Space direction='vertical' style={{ width: '100%' }} size='middle'>
                <GradientButton size='small' block onClick={() => setEditMode(!editMode)}>
                  {editMode ? 'Cancel Edit' : 'Edit Profile'}
                </GradientButton>
                <Button
                  icon={<LockOutlined />}
                  block
                  onClick={() => navigate('/profile/change-password')}
                >
                  Change Password
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card title='Personal Information'>
              <Form form={form} layout='vertical' disabled={!editMode}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name='firstName'
                      label='First Name'
                      rules={[{ required: true, message: 'Please enter first name' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder='First Name' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='lastName'
                      label='Last Name'
                      rules={[{ required: true, message: 'Please enter last name' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder='Last Name' />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name='email'
                  label='Email Address'
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder='Email' disabled />
                </Form.Item>

                <Form.Item
                  name='phone'
                  label='Phone Number'
                  rules={[
                    {
                      pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                      message: 'Please enter valid phone number',
                    },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder='Phone Number' />
                </Form.Item>

                {editMode && (
                  <Form.Item>
                    <Space>
                      <Button
                        type='primary'
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={loading}
                      >
                        Save Changes
                      </Button>
                      <Button onClick={() => setEditMode(false)}>Cancel</Button>
                    </Space>
                  </Form.Item>
                )}
              </Form>
            </Card>

            <Card title='Security Settings' style={{ marginTop: 24 }}>
              <Space direction='vertical' style={{ width: '100%' }} size='large'>
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p style={{ color: '#666', marginBottom: 8 }}>
                    Add an extra layer of security to your account
                  </p>
                  <Switch defaultChecked={false} />{' '}
                  <span style={{ marginLeft: 8 }}>Enable 2FA</span>
                </div>
                <Divider style={{ margin: 0 }} />
                <div>
                  <h4>Email Notifications</h4>
                  <p style={{ color: '#666', marginBottom: 8 }}>
                    Receive email notifications for important updates
                  </p>
                  <Switch defaultChecked={true} />{' '}
                  <span style={{ marginLeft: 8 }}>Enable Notifications</span>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage;
