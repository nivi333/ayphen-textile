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
import { invoiceService, InvoiceSummary, InvoiceStatus } from '@/services/invoiceService';
import useAuth from '@/contexts/AuthContext';
import { useSortableTable } from '@/hooks/useSortableTable';

const STATUS_COLORS: Record<InvoiceStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  DRAFT: 'default',
  SENT: 'info',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  OVERDUE: 'error',
  CANCELLED: 'error',
};

const AccountsReceivablePage = () => {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReceivable: 0,
    overdueInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
  });

  useEffect(() => {
    if (currentCompany) {
      fetchData();
    }
  }, [currentCompany]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const invoicesData = await invoiceService.getInvoices();
      setInvoices(invoicesData);

      // Calculate statistics
      const totalReceivable = invoicesData
        .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
        .reduce((sum, i) => sum + i.totalAmount, 0);
      const overdueInvoices = invoicesData
        .filter(i => i.status === 'OVERDUE')
        .reduce((sum, i) => sum + i.totalAmount, 0);
      const paidInvoices = invoicesData
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + i.totalAmount, 0);
      const pendingInvoices = invoicesData
        .filter(i => i.status === 'SENT' || i.status === 'DRAFT')
        .reduce((sum, i) => sum + i.totalAmount, 0);

      setStats({
        totalReceivable,
        overdueInvoices,
        paidInvoices,
        pendingInvoices,
      });
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error(error.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: InvoiceSummary) => {
    navigate(`/invoices/${invoice.invoiceId}`);
  };

  const handleRecordPayment = (invoice: InvoiceSummary) => {
    toast.info(`Record payment for invoice ${invoice.invoiceId}`);
  };

  const handleSendReminder = (invoice: InvoiceSummary) => {
    toast.info(`Send reminder for invoice ${invoice.invoiceId}`);
  };

  const {
    sortedData: sortedInvoices,
    sortColumn,
    sortDirection,
    handleSort,
  } = useSortableTable({
    data: invoices,
    defaultSortColumn: 'invoiceDate',
    defaultSortDirection: 'desc',
  });

  if (!currentCompany) {
    return (
      <PageContainer>
        <div className='text-center text-muted-foreground'>
          Please select a company to manage accounts receivable.
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
        <span className='text-foreground'>Accounts Receivable</span>
      </div>

      <PageHeader>
        <PageTitle>Accounts Receivable</PageTitle>
      </PageHeader>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-primary mb-1'>
                ${stats.totalReceivable.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Total Receivable</p>
            </div>
            <DollarSign className='h-5 w-5 text-primary' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-error mb-1'>
                ${stats.overdueInvoices.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Overdue Invoices</p>
            </div>
            <DollarSign className='h-5 w-5 text-error' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-success mb-1'>
                ${stats.paidInvoices.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Paid Invoices</p>
            </div>
            <DollarSign className='h-5 w-5 text-success' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-warning mb-1'>
                ${stats.pendingInvoices.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Pending Invoices</p>
            </div>
            <DollarSign className='h-5 w-5 text-warning' />
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className='flex items-center justify-center min-h-[300px]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState message='No invoices found' />
      ) : (
        <Card>
          <DataTable sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
            <TableHeader>
              <TableRow>
                <TableHead sortable sortKey='invoiceId'>
                  Invoice ID
                </TableHead>
                <TableHead sortable sortKey='customerName'>
                  Customer
                </TableHead>
                <TableHead sortable sortKey='status'>
                  Status
                </TableHead>
                <TableHead sortable sortKey='invoiceDate'>
                  Invoice Date
                </TableHead>
                <TableHead sortable sortKey='dueDate'>
                  Due Date
                </TableHead>
                <TableHead className='text-right' sortable sortKey='totalAmount'>
                  Total Amount
                </TableHead>
                <TableHead className='text-right'>Amount Due</TableHead>
                <TableHead className='w-[50px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map(invoice => {
                const amountDue = invoice.totalAmount - (invoice.amountPaid || 0);
                const isOverdue =
                  invoice.dueDate &&
                  new Date(invoice.dueDate) < new Date() &&
                  invoice.status !== 'PAID';

                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className='text-primary hover:underline'
                      >
                        {invoice.invoiceId}
                      </button>
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>
                      <StatusBadge variant={STATUS_COLORS[invoice.status]}>
                        {invoice.status.replace('_', ' ')}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={isOverdue ? 'text-error font-medium' : ''}>
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                      </span>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {invoice.currency} {invoice.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {invoice.currency} {amountDue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            View Invoice
                          </DropdownMenuItem>
                          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                            <DropdownMenuItem onClick={() => handleRecordPayment(invoice)}>
                              Record Payment
                            </DropdownMenuItem>
                          )}
                          {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                            <DropdownMenuItem onClick={() => handleSendReminder(invoice)}>
                              Send Reminder
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

export default AccountsReceivablePage;
