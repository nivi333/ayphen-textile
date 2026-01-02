import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DollarSign, MoreVertical, Home, Loader2 } from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  Card,
  StatusBadge,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '@/components/globalComponents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { billService, BillSummary, BillStatus } from '@/services/billService';
import useAuth from '@/contexts/AuthContext';
import { useSortableTable } from '@/hooks/useSortableTable';

const STATUS_COLORS: Record<BillStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  DRAFT: 'default',
  RECEIVED: 'info',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  OVERDUE: 'error',
  CANCELLED: 'error',
};

const AccountsPayablePage = () => {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const [bills, setBills] = useState<BillSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPayable: 0,
    overdueBills: 0,
    paidBills: 0,
    pendingBills: 0,
  });

  useEffect(() => {
    if (currentCompany) {
      fetchData();
    }
  }, [currentCompany]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const billsData = await billService.getBills();
      setBills(billsData);

      // Calculate statistics
      const totalPayable = billsData
        .filter(b => b.status !== 'PAID' && b.status !== 'CANCELLED')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      const overdueBills = billsData
        .filter(b => b.status === 'OVERDUE')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      const paidBills = billsData
        .filter(b => b.status === 'PAID')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      const pendingBills = billsData
        .filter(b => b.status === 'RECEIVED' || b.status === 'DRAFT')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      setStats({
        totalPayable,
        overdueBills,
        paidBills,
        pendingBills,
      });
    } catch (error: any) {
      console.error('Error fetching bills:', error);
      toast.error(error.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = (bill: BillSummary) => {
    navigate(`/bills/${bill.billId}`);
  };

  const handleRecordPayment = (bill: BillSummary) => {
    toast.info(`Record payment for bill ${bill.billId}`);
  };

  const {
    sortedData: sortedBills,
    sortColumn,
    sortDirection,
    handleSort,
  } = useSortableTable({
    data: bills,
    defaultSortColumn: 'billDate',
    defaultSortDirection: 'desc',
  });

  if (!currentCompany) {
    return (
      <PageContainer>
        <div className='text-center text-muted-foreground'>
          Please select a company to manage accounts payable.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
        <button
          onClick={() => navigate('/finance')}
          className='hover:text-foreground flex items-center gap-1'
        >
          <Home className='h-4 w-4' />
          Finance Overview
        </button>
        <span>/</span>
        <span className='text-foreground'>Accounts Payable</span>
      </div>

      <PageHeader>
        <PageTitle>Accounts Payable</PageTitle>
      </PageHeader>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-primary mb-1'>
                ${stats.totalPayable.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Total Payable</p>
            </div>
            <DollarSign className='h-5 w-5 text-primary' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-error mb-1'>${stats.overdueBills.toFixed(2)}</p>
              <p className='text-sm text-muted-foreground'>Overdue Bills</p>
            </div>
            <DollarSign className='h-5 w-5 text-error' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-success mb-1'>${stats.paidBills.toFixed(2)}</p>
              <p className='text-sm text-muted-foreground'>Paid Bills</p>
            </div>
            <DollarSign className='h-5 w-5 text-success' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-warning mb-1'>
                ${stats.pendingBills.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Pending Bills</p>
            </div>
            <DollarSign className='h-5 w-5 text-warning' />
          </div>
        </Card>
      </div>

      {/* Bills Table */}
      {loading ? (
        <div className='flex items-center justify-center min-h-[300px]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : bills.length === 0 ? (
        <EmptyState message='No bills found' />
      ) : (
        <Card>
          <DataTable sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
            <TableHeader>
              <TableRow>
                <TableHead sortable sortKey='billId'>
                  Bill ID
                </TableHead>
                <TableHead sortable sortKey='supplierName'>
                  Supplier
                </TableHead>
                <TableHead sortable sortKey='status'>
                  Status
                </TableHead>
                <TableHead sortable sortKey='billDate'>
                  Bill Date
                </TableHead>
                <TableHead sortable sortKey='dueDate'>
                  Due Date
                </TableHead>
                <TableHead className='text-right' sortable sortKey='totalAmount'>
                  Total Amount
                </TableHead>
                <TableHead
                  className='text-right'
                  // Amount Due is calculated, might need custom sort logic or pre-calculation if we want to sort by it.
                  // For now, let's skip sorting on calculated field unless we map it.
                >
                  Amount Due
                </TableHead>
                <TableHead className='w-[50px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBills.map(bill => {
                const amountDue = bill.totalAmount - (bill.amountPaid || 0);
                const isOverdue =
                  bill.dueDate && new Date(bill.dueDate) < new Date() && bill.status !== 'PAID';

                return (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <button
                        onClick={() => handleViewBill(bill)}
                        className='text-primary hover:underline'
                      >
                        {bill.billId}
                      </button>
                    </TableCell>
                    <TableCell>{bill.supplierName}</TableCell>
                    <TableCell>
                      <StatusBadge variant={STATUS_COLORS[bill.status]}>
                        {bill.status.replace('_', ' ')}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{new Date(bill.billDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={isOverdue ? 'text-error font-medium' : ''}>
                        {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '-'}
                      </span>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {bill.currency} {bill.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {bill.currency} {amountDue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleViewBill(bill)}>
                            View Bill
                          </DropdownMenuItem>
                          {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                            <DropdownMenuItem onClick={() => handleRecordPayment(bill)}>
                              Record Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DataTable>
        </Card>
      )}
    </PageContainer>
  );
};

export default AccountsPayablePage;
