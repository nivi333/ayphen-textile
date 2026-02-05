import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { qualityService } from '@/services/qualityService';

const CHECKPOINT_TYPES = [
  { value: 'INCOMING_MATERIAL', label: 'Incoming Material' },
  { value: 'IN_PROCESS', label: 'In Process' },
  { value: 'FINAL_INSPECTION', label: 'Final Inspection' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'RANDOM_SAMPLING', label: 'Random Sampling' },
  { value: 'BATCH_TEST', label: 'Batch Test' },
];

const checkpointSchema = z.object({
  checkpointType: z.string().min(1, 'Checkpoint type is required'),
  checkpointName: z.string().min(1, 'Checkpoint name is required'),
  inspectorName: z.string().min(1, 'Inspector name is required'),
  inspectionDate: z.date({ required_error: 'Inspection date is required' }),
  batchNumber: z.string().optional(),
  lotNumber: z.string().optional(),
  sampleSize: z.coerce.number().min(0).optional(),
  testedQuantity: z.coerce.number().min(0).optional(),
  overallScore: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CheckpointFormValues = z.infer<typeof checkpointSchema>;

interface QualityCheckpointFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  checkpoint?: any;
}

export function QualityCheckpointFormSheet({
  open,
  onOpenChange,
  onSuccess,
  checkpoint,
}: QualityCheckpointFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!checkpoint;

  const form = useForm<CheckpointFormValues>({
    resolver: zodResolver(checkpointSchema) as any,
    defaultValues: { isActive: true, inspectionDate: new Date() },
  });

  useEffect(() => {
    if (open && checkpoint) {
      form.reset({
        checkpointType: checkpoint.checkpointType || '',
        checkpointName: checkpoint.checkpointName || '',
        inspectorName: checkpoint.inspectorName || '',
        inspectionDate: checkpoint.inspectionDate
          ? new Date(checkpoint.inspectionDate)
          : new Date(),
        batchNumber: checkpoint.batchNumber || '',
        lotNumber: checkpoint.lotNumber || '',
        sampleSize: checkpoint.sampleSize || 0,
        testedQuantity: checkpoint.testedQuantity || 0,
        overallScore: checkpoint.overallScore || 0,
        notes: checkpoint.notes || '',
        isActive: checkpoint.isActive ?? true,
      });
    } else if (open) {
      form.reset({ isActive: true, inspectionDate: new Date() });
    }
  }, [open, checkpoint, form]);

  const onSubmit = async (values: CheckpointFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        inspectionDate: values.inspectionDate.toISOString(),
      };

      if (isEditing && checkpoint) {
        await qualityService.updateCheckpoint(checkpoint.id, payload);
        toast.success('Checkpoint updated successfully');
      } else {
        await qualityService.createCheckpoint(payload as any);
        toast.success('Checkpoint created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save checkpoint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[720px] sm:max-w-[720px] overflow-y-auto'>
        <SheetHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <SheetTitle>
            {isEditing ? 'Edit Quality Checkpoint' : 'New Quality Checkpoint'}
          </SheetTitle>
          <div className='flex items-center space-x-2 mr-6'>
            <span className='text-sm text-muted-foreground'>Active</span>
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={checked => form.setValue('isActive', checked)}
              disabled={!isEditing}
            />
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Basic Information</h3>

              {isEditing && checkpoint?.checkpointId && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                    Code
                  </label>
                  <Input value={checkpoint.checkpointId} disabled className='bg-muted' />
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='checkpointType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Checkpoint Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select checkpoint type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CHECKPOINT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='checkpointName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Checkpoint Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter checkpoint name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='inspectorName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Inspector Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter inspector name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='inspectionDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel required>Inspection Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                          placeholder='Select date'
                          className='w-full'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='batchNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter batch number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lotNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lot Number</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter lot number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='sampleSize'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample Size</FormLabel>
                      <FormControl>
                        <Input type='number' min='0' placeholder='0' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='testedQuantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tested Quantity</FormLabel>
                      <FormControl>
                        <Input type='number' min='0' placeholder='0' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='overallScore'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Score (0-100)</FormLabel>
                      <FormControl>
                        <Input type='number' min='0' max='100' placeholder='0' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter notes' className='min-h-[80px]' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className='flex gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEditing ? 'Update' : 'Create'} Checkpoint
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
