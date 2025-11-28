import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Divider, Row, Space, Spin, Typography, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { MainLayout } from '../../components/layout';
import useAuth from '../../contexts/AuthContext';
import { UserProfileDrawer } from '../../components/UserProfileDrawer';
import { UserAvatar } from '../../components/ui/UserAvatar';
import './UserProfilePage.scss';

const { Title, Text } = Typography;

type SectionItem = {
  label: string;
  value?: React.ReactNode;
};

type ProfileSection = {
  key: string;
  title: string;
  items: SectionItem[];
};

const getDisplayValue = (value?: React.ReactNode) => {
  if (value === null || value === undefined) {
    return <span className='profile-info-empty'>-</span>;
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return <span className='profile-info-empty'>-</span>;
  }

  return value;
};

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleEditProfile = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleProfileUpdated = async () => {
    await refreshUser();
    // message.success('Profile updated successfully'); // Already handled in drawer
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

  const profileSections: ProfileSection[] = [
    {
      key: 'personal-information',
      title: 'Personal Information',
      items: [
        { label: 'First Name', value: currentUser.firstName },
        { label: 'Last Name', value: currentUser.lastName },
        { label: 'Email Address', value: currentUser.email },
        { label: 'Phone Number', value: currentUser.phone },
      ],
    },
    {
      key: 'security-settings',
      title: 'Security Settings',
      items: [
        {
          label: 'Two-Factor Authentication',
          value: (
            <Tag icon={<SafetyCertificateOutlined />} color='default'>
              Disabled
            </Tag>
          ),
        },
        {
          label: 'Email Notifications',
          value: (
            <Tag icon={<BellOutlined />} color='success'>
              Enabled
            </Tag>
          ),
        },
        {
          label: 'Password',
          value: (
            <Button
              type='link'
              size='small'
              onClick={() => navigate('/profile/change-password')}
              style={{ padding: 0 }}
            >
              Change Password
            </Button>
          ),
        },
      ],
    },
  ];

  const contactPills = [
    currentUser.email && {
      icon: <MailOutlined />,
      text: currentUser.email,
    },
    currentUser.phone && {
      icon: <PhoneOutlined />,
      text: currentUser.phone,
    },
  ].filter(Boolean) as { icon: React.ReactNode; text: React.ReactNode }[];

  return (
    <MainLayout>
      <div className='company-detail-page'>
        {' '}
        {/* Reusing company detail page styles */}
        <div className='company-detail-top'>
          <div>
            <Title level={3} className='company-detail-title'>
              My Profile
            </Title>
            <Text type='secondary'>Manage your personal information and security settings</Text>
          </div>
          <Space size={8} wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className='ghost-button'>
              Back to Dashboard
            </Button>
            <Button type='primary' icon={<EditOutlined />} onClick={handleEditProfile}>
              Edit Profile
            </Button>
          </Space>
        </div>
        <Card className='company-profile-card' bodyStyle={{ padding: 24 }}>
          <div className='company-profile-overview'>
            <Space size={20} align='start'>
              <UserAvatar
                firstName={currentUser.firstName}
                lastName={currentUser.lastName}
                imageUrl={currentUser.avatarUrl}
                size={96}
                style={{ fontSize: 35 }}
              />
              <div className='company-profile-meta'>
                <Title level={4} className='company-profile-name'>
                  {currentUser.firstName} {currentUser.lastName}
                </Title>
                <div className='company-profile-tags'>
                  {/* Add roles or other tags if available */}
                  <Tag color='blue'>User</Tag>
                </div>
                {contactPills.length > 0 && (
                  <div className='company-profile-contact'>
                    {contactPills.map(item => (
                      <Space
                        key={String(item.text)}
                        size={8}
                        className='company-profile-contact-item'
                      >
                        {item.icon}
                        <span>{item.text}</span>
                      </Space>
                    ))}
                  </div>
                )}
              </div>
            </Space>
          </div>

          <Divider />

          {profileSections.map(section => (
            <div key={section.key} className='profile-section'>
              <div className='profile-section-title'>{section.title}</div>
              <Row gutter={[24, 24]}>
                {section.items.map(item => (
                  <Col key={`${section.key}-${item.label}`} xs={24} sm={12} lg={6}>
                    <div className='profile-info-item'>
                      <span className='profile-info-label'>{item.label}</span>
                      <span className='profile-info-value'>{getDisplayValue(item.value)}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Card>
      </div>

      <UserProfileDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        initialData={{
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          phone: currentUser.phone,
          avatarUrl: currentUser.avatarUrl,
        }}
        onProfileUpdated={handleProfileUpdated}
      />
    </MainLayout>
  );
};

export default UserProfilePage;
