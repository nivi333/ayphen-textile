import { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Tag,
  Avatar,
  Dropdown,
  Modal,
  message,
  Empty,
  Spin,
  Input,
  Space,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import useAuth from '../../contexts/AuthContext';
import { useHeader } from '../../contexts/HeaderContext';
import { customerService, Customer, CustomerFilters } from '../../services/customerService';
import { MainLayout } from '../../components/layout';
import { Heading } from '../../components/Heading';
import { GradientButton } from '../../components/ui';
import { CustomerDrawer } from '../../components/sales/CustomerDrawer';
import './CustomerListPage.scss';

export default function CustomerListPage() {
  const { currentCompany } = useAuth();
  const { setHeaderActions } = useHeader();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const fetchInProgressRef = useRef(false);

  // Set header actions when component mounts
  useEffect(() => {
    const isEmployee = currentCompany?.role === 'EMPLOYEE';
    setHeaderActions(
      <GradientButton
        onClick={handleAddCustomer}
        size='small'
        className='add-customer-btn'
        disabled={isEmployee}
      >
        Add Customer
      </GradientButton>
    );

    // Cleanup when component unmounts
    return () => setHeaderActions(null);
  }, [setHeaderActions, currentCompany?.role]);

  useEffect(() => {
    if (currentCompany) {
      fetchCustomers();
    }
  }, [currentCompany, searchText]);

  const fetchCustomers = async () => {
    if (fetchInProgressRef.current) {
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setLoading(true);
      const filters: CustomerFilters = {
        search: searchText || undefined,
      };
      const result = await customerService.getCustomers(filters);
      setCustomers(result.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setDrawerOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setDrawerOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    Modal.confirm({
      title: 'Delete Customer',
      content: `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setTableLoading(true);
          await customerService.deleteCustomer(customer.id);
          message.success('Customer deleted successfully');
          fetchCustomers();
        } catch (error) {
          console.error('Error deleting customer:', error);
          message.error('Failed to delete customer');
        } finally {
          setTableLoading(false);
        }
      },
    });
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingCustomer(undefined);
  };

  const handleCustomerSaved = () => {
    fetchCustomers();
    handleDrawerClose();
  };

  const getActionMenuItems = (customer: Customer) => {
    const isEmployee = currentCompany?.role === 'EMPLOYEE';
    return [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleEditCustomer(customer),
        disabled: isEmployee,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        onClick: () => handleDeleteCustomer(customer),
        danger: true,
        disabled: isEmployee,
      },
    ];
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      width: 300,
      render: (record: Customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar icon={<UserOutlined />} style={{ flexShrink: 0, backgroundColor: '#1890ff' }}>
            {record.name.charAt(0)}
          </Avatar>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className='customer-name' style={{ fontWeight: 500, marginBottom: 2 }}>
              {record.name}
            </div>
            <div className='customer-code' style={{ color: '#666', fontSize: '12px' }}>
              {record.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type: string) => <Tag color='blue'>{type}</Tag>,
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 250,
      render: (record: Customer) => (
        <div className='customer-contact'>
          {record.email && <div style={{ fontSize: '12px', marginBottom: 2 }}>{record.email}</div>}
          {record.phone && <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (record: Customer) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {record.city && record.state ? `${record.city}, ${record.state}` : '-'}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (record: Customer) => (
        <Tag color={record.isActive ? 'success' : 'default'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (record: Customer) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement='bottomRight'
        >
          <Button type='text' icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  if (!currentCompany) {
    return (
      <MainLayout>
        <div className='no-company-message'>Please select a company to manage customers.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className='page-container'>
        <div className='page-header-section'>
          <Heading level={2}>Customers</Heading>
        </div>

        <div className='filters-section'>
          <Space>
            <Input
              placeholder='Search customers...'
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </Space>
        </div>

        <div className='table-container'>
          {loading && customers.length === 0 ? (
            <div className='loading-container'>
              <Spin size='large' />
            </div>
          ) : customers.length === 0 && !searchText ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No Customers found'>
              <GradientButton
                size='small'
                onClick={handleAddCustomer}
                disabled={currentCompany?.role === 'EMPLOYEE'}
              >
                Create First Customer
              </GradientButton>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={customers}
              rowKey='id'
              loading={tableLoading || loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
              }}
              scroll={{ x: 1000 }}
              className='customers-table'
            />
          )}
        </div>
      </div>

      <CustomerDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        onCustomerCreated={handleCustomerSaved}
        onCustomerUpdated={handleCustomerSaved}
        mode={editingCustomer ? 'edit' : 'create'}
        customerId={editingCustomer?.id}
        initialData={editingCustomer}
      />
    </MainLayout>
  );
}
