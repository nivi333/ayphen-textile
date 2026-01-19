import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { qualityService } from '@/services/qualityService';

const SEVERITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'MAJOR', label: 'Major' },
  { value: 'MINOR', label: 'Minor' },
  { value: 'COSMETIC', label: 'Cosmetic' },
];

const DEFECT_CATEGORIES = [
  { value: 'FABRIC', label: 'Fabric' },
  { value: 'STITCHING', label: 'Stitching' },
  { value: 'COLOR', label: 'Color' },
  { value: 'MEASUREMENT', label: 'Measurement' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'FINISHING', label: 'Finishing' },
  { value: 'LABELING', label: 'Labeling' },
];

const defectSchema = z.object({
  checkpointId: z.string().optional(),
  defectCategory: z.string().min(1, 'Defect category is required'),
  defectType: z.string().min(1, 'Defect type is required'),
  severity: z.string().min(1, 'Severity is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  batchNumber: z.string().optional(),
  lotNumber: z.string().optional(),
  affectedItems: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DefectFormValues = z.infer<typeof defectSchema>;

interface QualityDefectFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defect?: any;
}

export function QualityDefectFormSheet({ open, onOpenChange, onSuccess, defect }: QualityDefectFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!defect;

  const form = useForm<DefectFormValues>({
    resolver: zodResolver(defectSchema) as any,
    defaultValues: { isActive: true, quantity: 1 },
  });

  useEffect(() => {
    if (open && defect) {
      form.reset({
        checkpointId: defect.checkpointId || '',
        defectCategory: defect.defectCategory || '',
        defectType: defect.defectType || '',
        severity: defect.severity || '',
        quantity: defect.quantity || 1,
        batchNumber: defect.batchNumber || '',
        lotNumber: defect.lotNumber || '',
        affectedItems: defect.affectedItems || 0,
        description: defect.description || '',
        imageUrl: defect.imageUrl || '',
        isActive: defect.isActive ?? true,
      });
    } else if (open) {
      form.reset({ isActive: true, quantity: 1 });
    }
  }, [open, defect, form]);

  const onSubmit = async (values: DefectFormValues) => {
    setLoading(true);
    try {
      await qualityService.createDefect(values as any);
      toast.success('Defect recorded successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to record defect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[720px] sm:max-w-[720px] overflow-y-auto'>
        <SheetHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <SheetTitle>{isEditing ? 'Edit Quality Defect' : 'New Quality Defect'}</SheetTitle>
          <div className='flex items-center space-x-2 mr-6'>
            <span className='text-sm text-muted-foreground'>Active</span>
            <Switch checked={form.watch('isActive')} onCheckedChange={checked => form.setValue('isActive', checked)} disabled={!isEditing} />
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Defect Information</h3>
              
              {isEditing && defect?.defectId && (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input value={defect.defectId} disabled className='bg-muted' />
                  </FormControl>
                </FormItem>
              )}

              <FormField control={form.control} name='checkpointId' render={({ field }) => (
                <FormItem>
                  <FormLabel>Checkpoint ID (Optional)</FormLabel>
                  <FormControl><Input placeholder='Enter checkpoint ID (if linked)' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className='grid grid-cols-2 gap-4'>
                <FormField control={form.control} name='defectCategory' render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Defect Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder='Select category' /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEFECT_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name='defectType' render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Defect Type</FormLabel>
                    <FormControl><Input placeholder='Enter type' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField control={form.control} name='severity' render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Severity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder='Select severity' /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name='quantity' render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Quantity</FormLabel>
                    <FormControl><Input type='number' min='1' placeholder='1' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField control={form.control} name='batchNumber' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number</FormLabel>
                    <FormControl><Input placeholder='Batch #' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name='lotNumber' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Number</FormLabel>
                    <FormControl><Input placeholder='Lot #' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name='affectedItems' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affected Items</FormLabel>
                    <FormControl><Input type='number' min='0' placeholder='0' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name='description' render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder='Describe the defect' className='min-h-[80px]' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name='imageUrl' render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input placeholder='Enter image URL (optional)' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <SheetFooter className='flex gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type='submit' disabled={loading}>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEditing ? 'Update' : 'Record'} Defect
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
