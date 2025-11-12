import { useState, useEffect } from 'react';
import { Button, message, Modal, Typography } from 'antd';
import { TeamOutlined, BankOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Company } from '../types/auth';
import { BrandLogo } from '../components/BrandLogo';
import { HeadingText } from '../components/ui';
import './CompaniesListPage.scss';

// Companies selection page component
import { Spin } from 'antd';

import { CompanyCreationDrawer } from '../components/CompanyCreationDrawer';

export function CompaniesListPage() {
  const { companies, switchCompany, isLoading, logout, refreshCompanies } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'owner' | 'roles'>('owner');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lazyLoading, setLazyLoading] = useState(true);

  // Lazy loading effect - show loading for 2-3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLazyLoading(false);
    }, 2500); // 2.5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const handleDrawerClose = () => setDrawerOpen(false);
  const handleCompanyCreated = async () => {
    setDrawerOpen(false);
    // Refresh the companies list after successful company creation
    try {
      await refreshCompanies();
    } catch (error) {
      console.error('Error refreshing companies:', error);
      message.warning('Company created but failed to refresh list. Please refresh the page.');
    }
  };

  // Filter companies by role
  const ownerCompanies = companies?.filter(c => c.role === 'OWNER') || [];
  const roleCompanies = companies?.filter(c => c.role !== 'OWNER') || [];

  if (isLoading || lazyLoading) {
    return (
      <div className='companies-loading'>
        <Spin size='large' tip='Loading companies...' />
      </div>
    );
  }

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

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to logout? You will be redirected to the login page.',
      okText: 'Yes, Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return new Promise(resolve => {
          setLogoutLoading(true);
          setTimeout(() => {
            try {
              logout();
              message.success('Logged out successfully');
              navigate('/login');
              resolve(true);
            } catch (error) {
              message.error('Failed to logout. Please try again.');
            } finally {
              setLogoutLoading(false);
            }
          }, 300); // Small delay to show loading state
        });
      },
      onCancel() {
        // User cancelled, do nothing
      },
    });
  };

  // Layout
  return (
    <div className='companies-root'>
      <div className='companies-top-bar'>
        <BrandLogo width={150} height={36} />
        <div className='companies-top-bar-actions'>
          <Button type='primary' className='companies-add-btn' onClick={() => setDrawerOpen(true)}>
            Add Company
          </Button>
          <Button
            type='default'
            danger
            loading={logoutLoading}
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            Logout
          </Button>
        </div>
      </div>
      <div className='companies-content'>
        <div className='companies-inner-wrapper'>
          <HeadingText>Select Company / Role</HeadingText>
          {companies && companies.length > 0 ? (
            <>
              <div className='companies-tabs'>
                <div
                  className={`companies-tab${activeTab === 'owner' ? ' active' : ''}`}
                  onClick={() => setActiveTab('owner')}
                >
                  Owner
                </div>
                <div
                  className={`companies-tab${activeTab === 'roles' ? ' active' : ''}`}
                  onClick={() => setActiveTab('roles')}
                >
                  Roles
                </div>
              </div>
              <div className='companies-list'>
                {(activeTab === 'owner' ? ownerCompanies : roleCompanies).length === 0 ? (
                  <div className='companies-empty'>No companies found</div>
                ) : (
                  <ul className='companies-list-ul'>
                    {(activeTab === 'owner' ? ownerCompanies : roleCompanies).map(company => (
                      <li
                        key={company.id}
                        className={`companies-card${loading ? ' loading' : ''}`}
                        onClick={() => !loading && handleCompanySelect(company)}
                        style={{ pointerEvents: loading ? 'none' : 'auto' }}
                      >
                        <div className='companies-card-left'>
                          <div>
                            <div className='companies-card-title'>
                              {company.logoUrl ? (
                                <img
                                  src={company.logoUrl}
                                  alt={`${company.name} logo`}
                                  className='companies-card-icon companies-card-logo'
                                />
                              ) : (
                                <BankOutlined className='companies-card-icon' />
                              )}
                              <Typography.Text className="companies-card-company-name">{company.name}</Typography.Text>
                            </div>
                          </div>
                        </div>
                        <div className='companies-card-icon-industry'>
                          <span className='companies-card-industry'>{company.industry}</span>
                          <TeamOutlined className='companies-card-team' />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className='companies-empty-state'>
              <BankOutlined className='companies-empty-icon' />
              <div className='companies-empty-text'>No company created</div>
            </div>
          )}
        </div>
      </div>
      <CompanyCreationDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}
