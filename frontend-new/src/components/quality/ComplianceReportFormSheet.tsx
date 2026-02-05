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

const REPORT_TYPES = [
  { value: 'ISO_9001', label: 'ISO 9001' },
  { value: 'ISO_14001', label: 'ISO 14001' },
  { value: 'OEKO_TEX', label: 'OEKO-TEX' },
  { value: 'GOTS', label: 'GOTS' },
  { value: 'WRAP', label: 'WRAP' },
  { value: 'SA8000', label: 'SA8000' },
  { value: 'BSCI', label: 'BSCI' },
  { value: 'SEDEX', label: 'SEDEX' },
];

const STATUS_OPTIONS = [
  { value: 'COMPLIANT', label: 'Compliant' },
  { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'EXPIRED', label: 'Expired' },
];

const CERTIFICATION_OPTIONS = [
  { value: 'ISO_9001', label: 'ISO 9001' },
  { value: 'OEKO_TEX', label: 'OEKO-TEX' },
  { value: 'GOTS', label: 'GOTS' },
  { value: 'WRAP', label: 'WRAP' },
  { value: 'SA8000', label: 'SA8000' },
];

const complianceSchema = z.object({
  reportType: z.string().min(1, 'Report type is required'),
  reportDate: z.date({ required_error: 'Report date is required' }),
  auditorName: z.string().min(1, 'Auditor name is required'),
  certification: z.string().optional(),
  validityPeriod: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  documentUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ComplianceFormValues = z.infer<typeof complianceSchema>;

interface ComplianceReportFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  report?: any;
}

export function ComplianceReportFormSheet({
  open,
  onOpenChange,
  onSuccess,
  report,
}: ComplianceReportFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!report;

  const form = useForm<ComplianceFormValues>({
    resolver: zodResolver(complianceSchema) as any,
    defaultValues: { isActive: true, status: 'PENDING_REVIEW', reportDate: new Date() },
  });

  useEffect(() => {
    if (open && report) {
      form.reset({
        reportType: report.reportType || '',
        reportDate: report.reportDate ? new Date(report.reportDate) : new Date(),
        auditorName: report.auditorName || '',
        certification: report.certification || '',
        validityPeriod: report.validityPeriod || '',
        status: report.status || 'DRAFT',
        findings: report.findings || '',
        recommendations: report.recommendations || '',
        documentUrl: report.documentUrl || '',
        isActive: report.isActive ?? true,
      });
    } else if (open) {
      form.reset({ isActive: true, status: 'PENDING_REVIEW', reportDate: new Date() });
    }
  }, [open, report, form]);

  const onSubmit = async (values: ComplianceFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        reportDate: values.reportDate.toISOString(),
      };

      if (isEditing && report) {
        await qualityService.updateComplianceReport(report.id, payload);
        toast.success('Compliance report updated successfully');
      } else {
        await qualityService.createComplianceReport(payload as any);
        toast.success('Compliance report created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save compliance report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[720px] sm:max-w-[720px] overflow-y-auto'>
        <SheetHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <SheetTitle>{isEditing ? 'Edit Compliance Report' : 'New Compliance Report'}</SheetTitle>
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
              <h3 className='text-sm font-medium text-muted-foreground'>Report Information</h3>

              {isEditing && report?.reportCode && (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input value={report.reportCode} disabled className='bg-muted' />
                  </FormControl>
                </FormItem>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='reportType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Report Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select report type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REPORT_TYPES.map(type => (
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
                  name='reportDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Report Date</FormLabel>
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
                  name='auditorName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Auditor Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter auditor name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
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
                  name='certification'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select certification' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CERTIFICATION_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
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
                  name='validityPeriod'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validity Period</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., 12 months' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='findings'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Findings</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter audit findings'
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

              <FormField
                control={form.control}
                name='documentUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document URL</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter document URL (optional)' {...field} />
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
                {isEditing ? 'Update' : 'Create'} Report
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
