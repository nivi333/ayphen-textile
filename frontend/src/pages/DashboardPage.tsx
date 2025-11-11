import { Card, Typography, Row, Col, Statistic, Space, Button } from 'antd';
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// Main dashboard page component
export function DashboardPage() {
  const { user, currentCompany } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Welcome back, {user?.firstName}!</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={1128}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={112800}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#7b5fc9' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Customers"
              value={93}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={12}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Recent Activity" extra={<Button type="link">View All</Button>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>New order received</Text>
                <br />
                <Text type="secondary">2 minutes ago</Text>
              </div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>Payment received</Text>
                <br />
                <Text type="secondary">1 hour ago</Text>
              </div>
              <div style={{ padding: '12px 0' }}>
                <Text strong>New customer registered</Text>
                <br />
                <Text type="secondary">3 hours ago</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Company Info">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Company:</Text>
                <br />
                <Text>{currentCompany?.name || 'No company selected'}</Text>
              </div>
              <div>
                <Text strong>Role:</Text>
                <br />
                <Text>{user?.role || 'N/A'}</Text>
              </div>
              <Button 
                type="primary" 
                icon={<SettingOutlined />}
                onClick={() => navigate('/company/settings')}
              >
                Company Settings
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
