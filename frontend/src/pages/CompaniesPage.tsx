import { useState } from 'react';
import { Card, Button, Typography, message } from 'antd';
import { PlusOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Company } from '../types/auth';

const { Title, Text } = Typography;

// Companies selection page component
export function CompaniesPage() {
  const { companies, switchCompany } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCompanySelect = async (company: Company) => {
    setLoading(true);
    try {
      await switchCompany(company);
      message.success('Company switched successfully');
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch company';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Select a Company</Title>
        <Text type="secondary">Choose which company you want to work with</Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {companies?.map((company) => (
          <Card
            key={company.id}
            hoverable
            style={{ borderRadius: '12px' }}
            actions={[
              <Button
                type="primary"
                key="select"
                loading={loading}
                onClick={() => handleCompanySelect(company)}
              >
                Select
              </Button>,
              <SettingOutlined key="settings" />,
              <TeamOutlined key="team" />
            ]}
          >
            <Card.Meta
              avatar={<TeamOutlined style={{ fontSize: '24px', color: '#7b5fc9' }} />}
              title={company.name}
              description={`${company.industry} • ${company.role}`}
            />
          </Card>
        ))}

        <Card
          hoverable
          style={{ 
            borderRadius: '12px',
            border: '2px dashed #d1d5db',
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px'
          }}
          onClick={() => navigate('/company/create')}
        >
          <div style={{ textAlign: 'center' }}>
            <PlusOutlined style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#6b7280', margin: 0 }}>Create New Company</Title>
            <Text type="secondary">Set up a new textile business</Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
