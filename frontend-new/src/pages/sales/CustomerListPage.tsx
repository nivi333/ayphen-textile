import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  ActionBar,
  SearchInput,
  Select,
  PrimaryButton,
} from '@/components/globalComponents';
import { CustomerTable } from '@/components/sales/CustomerTable';
import { CustomerFormSheet } from '@/components/sales/CustomerFormSheet';
import { customerService, Customer, CustomerFilters } from '@/services/customerService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 10,
  });

  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { customers: data } = await customerService.getCustomers({
        ...filters,
        search: searchQuery,
      });
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters, searchQuery]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger fetch via searchQuery state in dependency array
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedCustomers = [...customers].sort((a: any, b: any) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleCreate = () => {
    setEditingCustomer(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsSheetOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setIsDeleting(customer);
  };

  const confirmDelete = async () => {
    if (!isDeleting) return;

    try {
      await customerService.deleteCustomer(isDeleting.id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, data);
        toast.success('Customer updated successfully');
      } else {
        await customerService.createCustomer(data);
        toast.success('Customer created successfully');
      }
      setIsSheetOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Customers</PageTitle>
        <PrimaryButton onClick={handleCreate}>
          <Plus className='mr-2 h-4 w-4' /> Add Customer
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <SearchInput
          placeholder='Search customers...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='w-64'
        />
        <Select
          value={filters.customerType || 'ALL'}
          onChange={value =>
            setFilters(prev => ({ ...prev, customerType: value === 'ALL' ? undefined : value }))
          }
          options={[
            { label: 'All Types', value: 'ALL' },
            { label: 'Business', value: 'BUSINESS' },
            { label: 'Individual', value: 'INDIVIDUAL' },
          ]}
          className='w-40'
        />
        <Select
          value={filters.isActive === undefined ? 'ALL' : filters.isActive.toString()}
          onChange={value =>
            setFilters(prev => ({
              ...prev,
              isActive: value === 'ALL' ? undefined : value === 'true',
            }))
          }
          options={[
            { label: 'All Status', value: 'ALL' },
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' },
          ]}
          className='w-40'
        />
      </ActionBar>

      <CustomerTable
        customers={sortedCustomers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      <CustomerFormSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingCustomer}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={!!isDeleting} onOpenChange={open => !open && setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              <span className='font-medium text-foreground'> {isDeleting?.name} </span>
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
