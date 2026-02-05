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
import { OrderFormSheet } from '@/components/orders/OrderFormSheet';
import { orderService, OrderSummary, OrderStatus } from '@/services/orderService';
import { locationService } from '@/services/locationService';
import useAuth from '@/contexts/AuthContext';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon?: any }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary', icon: Clock },
  CONFIRMED: { label: 'Confirmed', variant: 'default', icon: CheckCircle },
  IN_PRODUCTION: { label: 'In Production', variant: 'outline', icon: Package },
  READY_TO_SHIP: { label: 'Ready to Ship', variant: 'outline', icon: Package },
  SHIPPED: { label: 'Shipped', variant: 'outline', icon: Truck },
  DELIVERED: { label: 'Delivered', variant: 'outline', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
};

const NEXT_STATUS_MAP: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['READY_TO_SHIP', 'CANCELLED'],
  READY_TO_SHIP: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function OrdersListPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sheet & Dialogs
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const { currentCompany } = useAuth();

  useEffect(() => {
    if (currentCompany?.id) {
      fetchLocations();
      fetchOrders();
    }
  }, [currentCompany?.id]);

  useEffect(() => {
    if (currentCompany?.id) {
      fetchOrders();
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Note: OrderService.getOrders(params) supports status, customerName etc.
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchText) params.customerName = searchText; // Simple search mapping

      const response = await orderService.getOrders(params);
      setOrders(response || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleCreate = () => {
    setEditingOrder(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (order: OrderSummary) => {
    // Open sheet immediately to prevent delay
    setEditingOrder(null);
    setIsDetailLoading(true);
    setIsSheetOpen(true);

    try {
      // Fetch full details while sheet is open
      const details = await orderService.getOrderById(order.orderId);
      setEditingOrder(details);
    } catch (error) {
      toast.error('Failed to load order details');
      setIsSheetOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await orderService.deleteOrder(orderToDelete);
      toast.success('Order deleted');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete order');
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic update
    const previousOrders = [...orders];
    setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, status: newStatus } : o)));
    toast.success(`Order status updated to ${STATUS_CONFIG[newStatus].label}`);

    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      // Background refresh to ensure consistency
      fetchOrders();
    } catch (error: any) {
      // Revert on failure
      setOrders(previousOrders);
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
        <EmptyState message='Please select a company to view orders.' />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Sales Orders</PageTitle>
        <PrimaryButton onClick={handleCreate}>
          <Plus className='mr-2 h-4 w-4' /> Create Order
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <div className='flex-1 max-w-md'>
          <SearchInput
            placeholder='Search by customer...'
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
                {STATUS_CONFIG[status as OrderStatus].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ActionBar>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Total</TableHead>
              <TableHead className='w-[60px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-10'>
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-10 text-muted-foreground'>
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map(order => {
                const statusInfo = STATUS_CONFIG[order.status] || {
                  label: order.status,
                  variant: 'secondary',
                };

                return (
                  <TableRow key={order.orderId} data-testid='order-row'>
                    <TableCell className='font-medium'>{order.orderId}</TableCell>
                    <TableCell>
                      <div className='font-medium'>{order.customerName}</div>
                      {order.customerCode && (
                        <div className='text-xs text-muted-foreground'>{order.customerCode}</div>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(order.orderDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{getLocationName(order.locationId)}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {order.currency}{' '}
                      {Number(order.totalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-8 w-8 p-0'
                            data-testid='order-actions'
                          >
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(order)}>
                            <Edit className='mr-2 h-4 w-4' /> Edit
                          </DropdownMenuItem>
                          {NEXT_STATUS_MAP[order.status]?.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              {NEXT_STATUS_MAP[order.status].map(nextStatus => (
                                <DropdownMenuItem
                                  key={nextStatus}
                                  onClick={() => handleStatusChange(order.orderId, nextStatus)}
                                >
                                  {STATUS_CONFIG[nextStatus].label}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={() => handleDeleteClick(order.orderId)}
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
        </Table>
      </div>

      <OrderFormSheet
        open={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingOrder(null);
        }}
        onSaved={handleRefresh}
        initialData={editingOrder}
        isLoading={isDetailLoading}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order and remove it
              from our servers.
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
