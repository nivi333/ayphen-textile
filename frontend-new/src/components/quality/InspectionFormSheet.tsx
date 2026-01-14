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

import {
  inspectionService,
  Inspection,
  CreateInspectionData,
} from '@/services/inspectionService';

const INSPECTION_TYPES = [
  { value: 'INCOMING_MATERIAL', label: 'Incoming Material' },
  { value: 'IN_PROCESS', label: 'In Process' },
  { value: 'FINAL_PRODUCT', label: 'Final Product' },
  { value: 'RANDOM_CHECK', label: 'Random Check' },
];

const INSPECTION_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PASSED', label: 'Passed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CONDITIONAL', label: 'Conditional' },
];

const REFERENCE_TYPES = [
  { value: 'PRODUCT', label: 'Product' },
  { value: 'ORDER', label: 'Order' },
  { value: 'BATCH', label: 'Batch' },
  { value: 'SHIPMENT', label: 'Shipment' },
];

const inspectionSchema = z.object({
  inspectionType: z.string().min(1, 'Inspection type is required'),
  referenceType: z.string().min(1, 'Reference type is required'),
  referenceId: z.string().min(1, 'Reference ID is required'),
  inspectorName: z.string().optional(),
  scheduledDate: z.date().optional(),
  inspectionDate: z.date().optional(),
  status: z.string().optional(),
  qualityScore: z.coerce.number().min(0).max(100).optional(),
  inspectorNotes: z.string().optional(),
  recommendations: z.string().optional(),
  isActive: z.boolean().default(true),
});

type InspectionFormValues = z.infer<typeof inspectionSchema>;

interface InspectionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  inspection?: Inspection;
}

export function InspectionFormSheet({
  open,
  onOpenChange,
  onSuccess,
  inspection,
}: InspectionFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!inspection;

  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionSchema) as any,
    defaultValues: {
      isActive: true,
      status: 'PENDING',
      scheduledDate: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      if (inspection) {
        form.reset({
          inspectionType: inspection.inspectionType,
          referenceType: inspection.referenceType,
          referenceId: inspection.referenceId,
          inspectorName: inspection.inspectorName || '',
          scheduledDate: inspection.scheduledDate ? new Date(inspection.scheduledDate) : undefined,
          inspectionDate: inspection.inspectionDate ? new Date(inspection.inspectionDate) : undefined,
          status: inspection.status,
          qualityScore: inspection.qualityScore || 0,
          inspectorNotes: '',
          recommendations: '',
          isActive: inspection.isActive ?? true,
        });
      } else {
        form.reset({
          isActive: true,
          status: 'PENDING',
          scheduledDate: new Date(),
          qualityScore: 0,
        });
      }
    }
  }, [open, inspection, form]);

  const onSubmit = async (values: InspectionFormValues) => {
    setLoading(true);
    try {
      const payload: CreateInspectionData = {
        inspectionType: values.inspectionType as any,
        referenceType: values.referenceType,
        referenceId: values.referenceId,
        inspectorName: values.inspectorName,
        scheduledDate: values.scheduledDate?.toISOString(),
        inspectionDate: values.inspectionDate?.toISOString(),
        status: values.status as any,
        qualityScore: values.qualityScore,
        inspectorNotes: values.inspectorNotes,
        recommendations: values.recommendations,
        isActive: values.isActive,
      };

      if (isEditing && inspection) {
        // Update inspection - would need updateInspection method in service
        toast.info('Update functionality to be implemented');
      } else {
        await inspectionService.createInspection(payload);
        toast.success('Inspection created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving inspection:', error);
      toast.error(error.message || 'Failed to save inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[720px] sm:max-w-[720px] overflow-y-auto'>
        <SheetHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <SheetTitle>{isEditing ? 'Edit Inspection' : 'New Inspection'}</SheetTitle>
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
            {/* Basic Information */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Basic Information</h3>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='inspectionType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Inspection Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INSPECTION_TYPES.map(type => (
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
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INSPECTION_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='referenceType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Reference Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select reference type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REFERENCE_TYPES.map(type => (
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
                  name='referenceId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Reference ID</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter reference ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='inspectorName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter inspector name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Schedule & Dates */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Schedule & Dates</h3>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='scheduledDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Scheduled Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                          placeholder='Select scheduled date'
                          className='w-full'
                        />
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
                      <FormLabel>Inspection Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                          placeholder='Select inspection date'
                          className='w-full'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='qualityScore'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Score (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        max='100'
                        placeholder='Enter quality score'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes & Recommendations */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Notes & Recommendations</h3>

              <FormField
                control={form.control}
                name='inspectorNotes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter inspector notes'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='recommendations'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommendations</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter recommendations'
                        className='min-h-[80px]'
                        {...field}
                      />
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
                {isEditing ? 'Update' : 'Create'} Inspection
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
