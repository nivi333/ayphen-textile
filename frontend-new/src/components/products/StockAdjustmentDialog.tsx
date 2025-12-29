import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/globalComponents';
import { ProductSummary, StockAdjustmentRequest, productService } from '@/services/productService';
import { toast } from 'sonner';
import useAuth from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const adjustmentSchema = z.object({
  adjustmentType: z.enum([
    'ADD',
    'REMOVE',
    'SET',
    'SALE',
    'PURCHASE',
    'RETURN',
    'DAMAGE',
    'TRANSFER',
  ]),
  quantity: z.coerce.number().min(0, 'Quantity must be positive'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdjusted: () => void;
  product: ProductSummary | null;
}

export function StockAdjustmentDialog({
  open,
  onClose,
  onAdjusted,
  product,
}: StockAdjustmentDialogProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adjustmentType: 'ADD',
      quantity: 0,
    },
  });

  const adjustmentType = form.watch('adjustmentType');
  const quantity = form.watch('quantity');

  useEffect(() => {
    if (open) {
      form.reset({
        adjustmentType: 'ADD',
        quantity: 0,
        reason: '',
        notes: '',
      });
    }
  }, [open, form]);

  const calculateNewStock = () => {
    if (!product) return 0;
    const currentStock = product.stockQuantity || 0;
    const qty = Number(quantity) || 0;

    switch (adjustmentType) {
      case 'ADD':
      case 'PURCHASE':
      case 'RETURN':
        return currentStock + qty;
      case 'REMOVE':
      case 'SALE':
      case 'DAMAGE':
      case 'TRANSFER':
        return currentStock - qty;
      case 'SET':
        return qty;
      default:
        return currentStock;
    }
  };

  const newStock = calculateNewStock();
  const currentStock = product?.stockQuantity || 0;

  const handleSubmit = async (values: AdjustmentFormValues) => {
    if (!product) return;

    // Validate negative stock unless allowed (assuming strict for now)
    if (newStock < 0) {
      toast.error('Adjustment would result in negative stock');
      return;
    }

    setSubmitting(true);
    try {
      const payload: StockAdjustmentRequest = {
        adjustmentType: values.adjustmentType,
        quantity: values.quantity,
        reason: values.reason,
        notes: values.notes,
        adjustedBy:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email || 'Unknown',
      };

      await productService.adjustStock(product.id, payload);
      toast.success('Stock adjusted successfully');
      onAdjusted();
      onClose();
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast.error(error.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Adjust Stock - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-3 gap-4 mb-4'>
          <Card className='p-4 flex flex-col items-center justify-center bg-muted/20'>
            <span className='text-xs text-muted-foreground uppercase font-bold'>Current</span>
            <span className='text-2xl font-bold'>{currentStock}</span>
            <span className='text-xs text-muted-foreground'>{product.unitOfMeasure}</span>
          </Card>
          <Card className='p-4 flex flex-col items-center justify-center bg-muted/20'>
            <span className='text-xs text-muted-foreground uppercase font-bold'>New</span>
            <span
              className={cn(
                'text-2xl font-bold transition-colors',
                newStock < 0
                  ? 'text-error'
                  : newStock < (product.reorderLevel || 0)
                    ? 'text-warning'
                    : 'text-success'
              )}
            >
              {newStock}
            </span>
            <span className='text-xs text-muted-foreground'>{product.unitOfMeasure}</span>
          </Card>
          <Card className='p-4 flex flex-col items-center justify-center bg-muted/20'>
            <span className='text-xs text-muted-foreground uppercase font-bold'>Reorder Level</span>
            <span className='text-2xl font-bold'>{product.reorderLevel || 0}</span>
            <span className='text-xs text-muted-foreground'>{product.unitOfMeasure}</span>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-2'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='adjustmentType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Adjustment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='ADD'>Add Stock</SelectItem>
                        <SelectItem value='REMOVE'>Remove Stock</SelectItem>
                        <SelectItem value='SET'>Set Stock Level</SelectItem>
                        <SelectItem value='PURCHASE'>Purchase</SelectItem>
                        <SelectItem value='SALE'>Sale</SelectItem>
                        <SelectItem value='RETURN'>Return</SelectItem>
                        <SelectItem value='DAMAGE'>Damage/Loss</SelectItem>
                        <SelectItem value='TRANSFER'>Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Quantity</FormLabel>
                    <FormControl>
                      <Input type='number' min='0' step='1' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Stock audit, New shipment' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Additional notes (optional)' rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning/Info Messages */}
            {newStock < 0 && (
              <div className='p-3 bg-error/10 border border-error/20 rounded-md text-sm text-error font-medium'>
                ⚠️ Warning: This adjustment will result in negative stock!
              </div>
            )}
            {product.reorderLevel && newStock <= product.reorderLevel && newStock >= 0 && (
              <div className='p-3 bg-warning/10 border border-warning/20 rounded-md text-sm text-warning font-medium'>
                ℹ️ Note: New stock level is at or below reorder level.
              </div>
            )}

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type='submit' disabled={submitting || newStock < 0}>
                {submitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Adjust Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
