import { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
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
import { BillFormSheet } from '@/components/bills';
import { billService, BillSummary, BillStatus } from '@/services/billService';
import { locationService } from '@/services/locationService';
import useAuth from '@/contexts/AuthContext';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<
  BillStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon?: any }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary', icon: Clock },
  RECEIVED: { label: 'Received', variant: 'outline', icon: Package },
  PARTIALLY_PAID: { label: 'Partially Paid', variant: 'outline', icon: DollarSign },
  PAID: { label: 'Paid', variant: 'default', icon: CheckCircle },
  OVERDUE: { label: 'Overdue', variant: 'destructive', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
};

const NEXT_STATUS_MAP: Record<BillStatus, BillStatus[]> = {
  DRAFT: ['RECEIVED', 'CANCELLED'],
  RECEIVED: ['PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'],
  PARTIALLY_PAID: ['PAID', 'OVERDUE'],
  OVERDUE: ['PARTIALLY_PAID', 'PAID'],
  PAID: [],
  CANCELLED: [],
};

export default function BillsListPage() {
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<BillSummary[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sheet & Dialogs
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<BillSummary | null>(null);

  const { currentCompany } = useAuth();

  useEffect(() => {
    if (currentCompany?.id) {
      fetchLocations();
      fetchBills();
    }
  }, [currentCompany?.id]);

  useEffect(() => {
    if (currentCompany?.id) {
      fetchBills();
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

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await billService.getBills();
      let filtered = response || [];

      // Apply filters
      if (statusFilter !== 'all') {
        filtered = filtered.filter(bill => bill.status === statusFilter);
      }
      if (searchText) {
        filtered = filtered.filter(
          bill =>
            bill.supplierName?.toLowerCase().includes(searchText.toLowerCase()) ||
            bill.billId?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setBills(filtered);
    } catch (error: any) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBill(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (bill: BillSummary) => {
    try {
      setLoading(true);
      const details = await billService.getBillById(bill.billId);
      setEditingBill(details);
      setIsSheetOpen(true);
    } catch (error) {
      toast.error('Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (bill: BillSummary) => {
    // Only DRAFT bills can be deleted
    if (bill.status !== 'DRAFT') {
      toast.error('Only draft bills can be deleted to maintain audit trail and financial records.');
      return;
    }
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!billToDelete) return;
    try {
      await billService.deleteBill(billToDelete.billId);
      toast.success('Bill deleted successfully');
      fetchBills();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bill');
    } finally {
      setDeleteDialogOpen(false);
      setBillToDelete(null);
    }
  };

  const handleStatusChange = async (billId: string, newStatus: BillStatus) => {
    try {
      await billService.updateBillStatus(billId, newStatus);
      toast.success(`Bill status updated to ${STATUS_CONFIG[newStatus].label}`);
      fetchBills();
    } catch (error: any) {
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
        <EmptyState message='Please select a company to view bills.' />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Bills</PageTitle>
        <PrimaryButton onClick={handleCreate}>
          <Plus className='mr-2 h-4 w-4' /> Create Bill
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <div className='flex-1 max-w-md'>
          <SearchInput
            placeholder='Search by supplier or bill ID...'
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
                {STATUS_CONFIG[status as BillStatus].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ActionBar>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Bill Date</TableHead>
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
                  Loading bills...
                </TableCell>
              </TableRow>
            ) : bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center py-10 text-muted-foreground'>
                  No bills found
                </TableCell>
              </TableRow>
            ) : (
              bills.map(bill => {
                const statusInfo = STATUS_CONFIG[bill.status] || {
                  label: bill.status,
                  variant: 'secondary',
                };
                const isOverdue =
                  bill.status !== 'PAID' &&
                  bill.status !== 'CANCELLED' &&
                  new Date(bill.dueDate) < new Date();

                return (
                  <TableRow key={bill.billId}>
                    <TableCell className='font-medium'>
                      <div>{bill.billId}</div>
                      {bill.billNumber && (
                        <div className='text-xs text-muted-foreground'>#{bill.billNumber}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>{bill.supplierName}</div>
                      {bill.supplierCode && (
                        <div className='text-xs text-muted-foreground'>{bill.supplierCode}</div>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(bill.billDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell className={isOverdue ? 'text-destructive' : ''}>
                      {format(new Date(bill.dueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getLocationName(bill.locationId)}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {bill.currency}{' '}
                      {Number(bill.totalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      <span
                        className={
                          isOverdue
                            ? 'text-destructive'
                            : Number(bill.balanceDue) > 0
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }
                      >
                        {bill.currency}{' '}
                        {Number(bill.balanceDue).toLocaleString(undefined, {
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
                          <DropdownMenuItem onClick={() => handleEdit(bill)}>
                            <Edit className='mr-2 h-4 w-4' /> Edit
                          </DropdownMenuItem>
                          {NEXT_STATUS_MAP[bill.status]?.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              {NEXT_STATUS_MAP[bill.status].map(nextStatus => (
                                <DropdownMenuItem
                                  key={nextStatus}
                                  onClick={() => handleStatusChange(bill.billId, nextStatus)}
                                >
                                  {STATUS_CONFIG[nextStatus].label}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                          {bill.status === 'DRAFT' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-destructive focus:text-destructive'
                                onClick={() => handleDeleteClick(bill)}
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

      <BillFormSheet
        open={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingBill(null);
        }}
        initialData={editingBill}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete bill "
              {billToDelete?.billId}" and remove it from our servers.
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
