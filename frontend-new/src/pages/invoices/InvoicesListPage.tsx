import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import {
  PageContainer,
  PageHeader,
  PageTitle,
  ActionBar,
  SearchInput,
  PrimaryButton,
  EmptyState,
} from '@/components/globalComponents';
import { InvoiceFormSheet } from '@/components/invoices';
import { invoiceService, InvoiceSummary, InvoiceStatus } from '@/services/invoiceService';
import { locationService } from '@/services/locationService';
import useAuth from '@/contexts/AuthContext';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon?: any }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary', icon: Clock },
  SENT: { label: 'Sent', variant: 'outline', icon: Send },
  PARTIALLY_PAID: { label: 'Partially Paid', variant: 'outline', icon: DollarSign },
  PAID: { label: 'Paid', variant: 'default', icon: CheckCircle },
  OVERDUE: { label: 'Overdue', variant: 'destructive', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
};

const NEXT_STATUS_MAP: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'],
  PARTIALLY_PAID: ['PAID', 'OVERDUE'],
  OVERDUE: ['PARTIALLY_PAID', 'PAID'],
  PAID: [],
  CANCELLED: [],
};

export default function InvoicesListPage() {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sheet & Dialogs
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceSummary | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const { currentCompany } = useAuth();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (currentCompany?.id) {
      fetchLocations();
      fetchInvoices();
    }
  }, [currentCompany?.id]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (currentCompany?.id) {
      fetchInvoices();
    }
  }, [searchText, statusFilter]);

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      setLocations(response || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getInvoices();
      let filtered = response || [];

      // Apply filters
      if (statusFilter !== 'all') {
        filtered = filtered.filter(inv => inv.status === statusFilter);
      }
      if (searchText) {
        filtered = filtered.filter(
          inv =>
            inv.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
            inv.invoiceId?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setInvoices(filtered);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (invoice: InvoiceSummary) => {
    setEditingInvoice(null);
    setIsDetailLoading(true);
    setIsSheetOpen(true);

    try {
      const details = await invoiceService.getInvoiceById(invoice.invoiceId);
      setEditingInvoice(details);
    } catch (error) {
      toast.error('Failed to load invoice details');
      setIsSheetOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDeleteClick = (invoice: InvoiceSummary) => {
    // Only DRAFT invoices can be deleted
    if (invoice.status !== 'DRAFT') {
      toast.error(
        'Only draft invoices can be deleted to maintain audit trail and financial records.'
      );
      return;
    }
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await invoiceService.deleteInvoice(invoiceToDelete.invoiceId);
      toast.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invoice');
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    // Optimistic update
    const previousInvoices = [...invoices];
    setInvoices(prev =>
      prev.map(inv => (inv.invoiceId === invoiceId ? { ...inv, status: newStatus } : inv))
    );
    toast.success(`Invoice status updated to ${STATUS_CONFIG[newStatus].label}`);

    try {
      await invoiceService.updateInvoiceStatus(invoiceId, newStatus);
      fetchInvoices();
    } catch (error: any) {
      setInvoices(previousInvoices);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return '—';
    const loc = locations.find(l => l.id === locationId);
    return loc ? loc.name : '—';
  };

  if (!currentCompany) {
    return (
      <PageContainer>
        <EmptyState message='Please select a company to view invoices.' />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Invoices</PageTitle>
        <PrimaryButton onClick={handleCreate}>
          <Plus className='mr-2 h-4 w-4' /> Create Invoice
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <div className='flex-1 max-w-md'>
          <SearchInput
            placeholder='Search by customer or invoice ID...'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onClear={() => setSearchText('')}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Filter className='h-4 w-4' />
              <SelectValue placeholder='Status' />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            {Object.keys(STATUS_CONFIG).map(status => (
              <SelectItem key={status} value={status}>
                {STATUS_CONFIG[status as InvoiceStatus].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ActionBar>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Total Amount</TableHead>
              <TableHead className='text-right'>Balance Due</TableHead>
              <TableHead className='w-[60px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center py-10'>
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center py-10 text-muted-foreground'>
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map(invoice => {
                const statusInfo = STATUS_CONFIG[invoice.status] || {
                  label: invoice.status,
                  variant: 'secondary',
                };
                const isOverdue =
                  invoice.status !== 'PAID' &&
                  invoice.status !== 'CANCELLED' &&
                  new Date(invoice.dueDate) < new Date();

                return (
                  <TableRow key={invoice.invoiceId}>
                    <TableCell className='font-medium'>
                      <div>{invoice.invoiceId}</div>
                      {invoice.invoiceNumber && (
                        <div className='text-xs text-muted-foreground'>
                          #{invoice.invoiceNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>{invoice.customerName}</div>
                      {invoice.customerCode && (
                        <div className='text-xs text-muted-foreground'>{invoice.customerCode}</div>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell className={isOverdue ? 'text-destructive' : ''}>
                      {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getLocationName(invoice.locationId)}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {invoice.currency}{' '}
                      {Number(invoice.totalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      <span
                        className={
                          isOverdue
                            ? 'text-destructive'
                            : Number(invoice.balanceDue) > 0
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }
                      >
                        {invoice.currency}{' '}
                        {Number(invoice.balanceDue).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                            <Edit className='mr-2 h-4 w-4' /> Edit
                          </DropdownMenuItem>
                          {NEXT_STATUS_MAP[invoice.status]?.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              {NEXT_STATUS_MAP[invoice.status].map(nextStatus => (
                                <DropdownMenuItem
                                  key={nextStatus}
                                  onClick={() => handleStatusChange(invoice.invoiceId, nextStatus)}
                                >
                                  {STATUS_CONFIG[nextStatus].label}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                          {invoice.status === 'DRAFT' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-destructive focus:text-destructive'
                                onClick={() => handleDeleteClick(invoice)}
                              >
                                <Trash2 className='mr-2 h-4 w-4' /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceFormSheet
        open={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingInvoice(null);
        }}
        initialData={editingInvoice}
        isLoading={isDetailLoading}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete invoice "
              {invoiceToDelete?.invoiceId}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
