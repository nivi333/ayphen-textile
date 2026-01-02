import { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Clock,
  FileText,
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
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/globalComponents';
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
import { useSortableTable } from '@/hooks/useSortableTable';
import { PurchaseOrderFormSheet } from '@/components/purchase';
import {
  purchaseOrderService,
  PurchaseOrderSummary,
  POStatus,
} from '@/services/purchaseOrderService';
import { locationService } from '@/services/locationService';
import useAuth from '@/contexts/AuthContext';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<
  POStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon?: any }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary', icon: Clock },
  SENT: { label: 'Sent', variant: 'outline', icon: FileText },
  CONFIRMED: { label: 'Confirmed', variant: 'default', icon: CheckCircle },
  PARTIALLY_RECEIVED: { label: 'Partially Received', variant: 'outline', icon: Package },
  RECEIVED: { label: 'Received', variant: 'outline', icon: Truck },
  CANCELLED: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
};

const NEXT_STATUS_MAP: Record<POStatus, POStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
  PARTIALLY_RECEIVED: ['RECEIVED'],
  RECEIVED: [],
  CANCELLED: [],
};

export default function PurchaseOrdersListPage() {
  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderSummary[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sheet & Dialogs
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<string | null>(null);

  const { currentCompany } = useAuth();

  useEffect(() => {
    if (currentCompany?.id) {
      fetchLocations();
      fetchPurchaseOrders();
    }
  }, [currentCompany?.id]);

  useEffect(() => {
    if (currentCompany?.id) {
      fetchPurchaseOrders();
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

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await purchaseOrderService.getPurchaseOrders();
      let filtered = response || [];

      // Apply filters
      if (statusFilter !== 'all') {
        filtered = filtered.filter(po => po.status === statusFilter);
      }
      if (searchText) {
        filtered = filtered.filter(po =>
          po.supplierName?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setPurchaseOrders(filtered);
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      toast.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPurchaseOrders();
  };

  const handleCreate = () => {
    setEditingPO(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (po: PurchaseOrderSummary) => {
    try {
      setLoading(true);
      const details = await purchaseOrderService.getPurchaseOrderById(po.poId);
      setEditingPO(details);
      setIsSheetOpen(true);
    } catch (error) {
      toast.error('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (poId: string) => {
    setPoToDelete(poId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!poToDelete) return;
    try {
      await purchaseOrderService.deletePurchaseOrder(poToDelete);
      toast.success('Purchase order deleted');
      fetchPurchaseOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete purchase order');
    } finally {
      setDeleteDialogOpen(false);
      setPoToDelete(null);
    }
  };

  const handleStatusChange = async (poId: string, newStatus: POStatus) => {
    try {
      await purchaseOrderService.updatePOStatus(poId, newStatus);
      toast.success(`Purchase order status updated to ${STATUS_CONFIG[newStatus].label}`);
      fetchPurchaseOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const {
    sortedData: sortedPurchaseOrders,
    sortColumn,
    sortDirection,
    handleSort,
  } = useSortableTable({
    data: purchaseOrders,
    defaultSortColumn: 'poId',
    defaultSortDirection: 'desc',
  });

  const getLocationName = (locationId?: string) => {
    if (!locationId) return '—';
    const loc = locations.find(l => l.id === locationId);
    return loc ? loc.name : '—';
  };

  if (!currentCompany) {
    return (
      <PageContainer>
        <EmptyState message='Please select a company to view purchase orders.' />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Purchase Orders</PageTitle>
        <PrimaryButton onClick={handleCreate}>
          <Plus className='mr-2 h-4 w-4' /> Create Purchase Order
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <div className='flex-1 max-w-md'>
          <SearchInput
            placeholder='Search by supplier...'
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
                {STATUS_CONFIG[status as POStatus].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ActionBar>

      <div className='rounded-md border bg-card'>
        <DataTable sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
          <TableHeader>
            <TableRow>
              <TableHead sortable sortKey='poId'>
                PO ID
              </TableHead>
              <TableHead sortable sortKey='supplierName'>
                Supplier
              </TableHead>
              <TableHead sortable sortKey='poDate'>
                PO Date
              </TableHead>
              <TableHead sortable sortKey='expectedDeliveryDate'>
                Expected Delivery
              </TableHead>
              <TableHead sortable sortKey='locationName'>
                Location
              </TableHead>
              <TableHead sortable sortKey='status'>
                Status
              </TableHead>
              <TableHead className='text-right' sortable sortKey='totalAmount'>
                Total
              </TableHead>
              <TableHead className='w-[60px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-10'>
                  Loading purchase orders...
                </TableCell>
              </TableRow>
            ) : sortedPurchaseOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-10 text-muted-foreground'>
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              sortedPurchaseOrders.map(po => {
                const statusInfo = STATUS_CONFIG[po.status] || {
                  label: po.status,
                  variant: 'secondary',
                };

                return (
                  <TableRow key={po.poId}>
                    <TableCell className='font-medium'>{po.poId}</TableCell>
                    <TableCell>
                      <div className='font-medium'>{po.supplierName}</div>
                      {po.supplierCode && (
                        <div className='text-xs text-muted-foreground'>{po.supplierCode}</div>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(po.poDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {po.expectedDeliveryDate
                        ? format(new Date(po.expectedDeliveryDate), 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell>{getLocationName(po.locationId)}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {po.currency}{' '}
                      {Number(po.totalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
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
                          <DropdownMenuItem onClick={() => handleEdit(po)}>
                            <Edit className='mr-2 h-4 w-4' /> Edit
                          </DropdownMenuItem>
                          {NEXT_STATUS_MAP[po.status]?.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              {NEXT_STATUS_MAP[po.status].map(nextStatus => (
                                <DropdownMenuItem
                                  key={nextStatus}
                                  onClick={() => handleStatusChange(po.poId, nextStatus)}
                                >
                                  {STATUS_CONFIG[nextStatus].label}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={() => handleDeleteClick(po.poId)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </DataTable>
      </div>

      <PurchaseOrderFormSheet
        open={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingPO(null);
        }}
        onSaved={handleRefresh}
        initialData={editingPO}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purchase order and
              remove it from our servers.
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
