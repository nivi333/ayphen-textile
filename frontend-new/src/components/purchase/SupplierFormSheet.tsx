import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { Supplier, supplierService } from '@/services/supplierService';
import { toast } from 'sonner';

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  supplierType: z.string().min(1, 'Type is required'),
  companyRegNo: z.string().optional(),

  // Contact Info
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  fax: z.string().optional(),

  // Address
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),

  // Financial
  paymentTerms: z.string().optional(),
  creditPeriod: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).optional()),
  currency: z.string().optional(),
  taxId: z.string().optional(),
  panNumber: z.string().optional(),
  bankDetails: z.string().optional(),

  // Supply Info
  leadTimeDays: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).optional()),
  minOrderQty: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).optional()),
  minOrderValue: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).optional()),

  // Quality & Compliance
  qualityRating: z.string().optional(),
  complianceStatus: z.string().optional(),

  // Additional
  supplierCategory: z.string().optional(),
  assignedManager: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormValues) => Promise<void>;
  initialData?: Supplier | null;
  isSubmitting?: boolean;
}

export function SupplierFormSheet({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: SupplierFormSheetProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      name: '',
      code: '',
      supplierType: '',
      companyRegNo: '',
      email: '',
      phone: '',
      alternatePhone: '',
      website: '',
      fax: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      paymentTerms: '',
      creditPeriod: undefined,
      currency: '',
      taxId: '',
      panNumber: '',
      bankDetails: '',
      leadTimeDays: undefined,
      minOrderQty: undefined,
      minOrderValue: undefined,
      qualityRating: '',
      complianceStatus: '',
      supplierCategory: '',
      assignedManager: '',
      notes: '',
      tags: [],
      isActive: true,
    },
  });

  const [nameUnique, setNameUnique] = useState(true);
  const [nameChecking, setNameChecking] = useState(false);
  const [originalName, setOriginalName] = useState('');

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>, field: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !field.value?.includes(value)) {
        field.onChange([...(field.value || []), value]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string, field: any) => {
    field.onChange(field.value?.filter((tag: string) => tag !== tagToRemove) || []);
  };

  useEffect(() => {
    if (initialData) {
      const resetData: any = { ...initialData };
      // Handle numeric and optional fields
      ['creditPeriod', 'leadTimeDays', 'minOrderQty', 'minOrderValue'].forEach(key => {
        if (resetData[key] === null) resetData[key] = undefined;
      });

      Object.keys(resetData).forEach(key => {
        if (resetData[key] === null || resetData[key] === undefined) {
          if (key === 'isActive') resetData[key] = true;
          else if (key === 'tags') resetData[key] = [];
          else resetData[key] = '';
        }
      });

      form.reset(resetData);
      setOriginalName(initialData.name);
      setNameUnique(true);
    } else {
      form.reset({
        name: '',
        supplierType: '',
        companyRegNo: '',
        email: '',
        phone: '',
        alternatePhone: '',
        website: '',
        fax: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        paymentTerms: '',
        creditPeriod: undefined,
        currency: '',
        taxId: '',
        panNumber: '',
        bankDetails: '',
        leadTimeDays: undefined,
        minOrderQty: undefined,
        minOrderValue: undefined,
        qualityRating: '',
        complianceStatus: '',
        supplierCategory: '',
        assignedManager: '',
        notes: '',
        tags: [],
        isActive: true,
      });
      setOriginalName('');
      setNameUnique(true);
    }
  }, [initialData, isOpen, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  // Name uniqueness validation
  const checkNameUnique = async (name: string) => {
    if (!name || name.trim() === '') {
      setNameUnique(true);
      return;
    }
    if (initialData && name.trim().toLowerCase() === originalName.trim().toLowerCase()) {
      setNameUnique(true);
      setNameChecking(false);
      return;
    }
    try {
      setNameChecking(true);
      const isAvailable = await supplierService.checkNameAvailability(name.trim());
      setNameUnique(isAvailable);
    } catch (error) {
      setNameUnique(true);
    } finally {
      setNameChecking(false);
    }
  };

  useEffect(() => {
    const nameValue = form.watch('name');
    if (!nameValue) return;

    // Don't check if the name hasn't changed from original
    if (initialData && nameValue.trim().toLowerCase() === originalName.trim().toLowerCase()) {
      setNameUnique(true);
      setNameChecking(false);
      return;
    }

    const timeoutId = setTimeout(() => checkNameUnique(nameValue), 500);
    return () => clearTimeout(timeoutId);
  }, [form.watch('name'), originalName, initialData]);

  const handleSubmit = async (data: SupplierFormValues) => {
    if (!nameUnique) {
      toast.error('Supplier name already exists. Please choose a different name.');
      return;
    }
    await onSubmit(data);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className='w-full sm:max-w-[650px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>{initialData ? 'Edit Supplier' : 'Add New Supplier'}</SheetTitle>
          <SheetDescription>
            {initialData ? 'Update supplier details' : 'Enter details for the new supplier'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-2'>
            {/* Basic Information */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-muted-foreground'>Basic Information</h3>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Code</FormLabel>
                      <FormControl>
                        <Input placeholder='Auto-generated' disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        Supplier Name
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            placeholder='Enter supplier name'
                            {...field}
                            onChange={e => {
                              field.onChange(e);
                              if (e.target.value && e.target.value.trim()) {
                                setNameChecking(true);
                              }
                            }}
                            className={!nameUnique ? 'border-red-500' : ''}
                          />
                          {nameChecking && (
                            <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground' />
                          )}
                        </div>
                      </FormControl>
                      {!nameUnique && (
                        <p className='text-sm text-red-500'>This supplier name is already in use</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='supplierType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        Supplier Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid='supplier-type-select'>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='MANUFACTURER' data-testid='type-manufacturer'>
                            Manufacturer
                          </SelectItem>
                          <SelectItem value='DISTRIBUTOR' data-testid='type-distributor'>
                            Distributor
                          </SelectItem>
                          <SelectItem value='WHOLESALER' data-testid='type-wholesaler'>
                            Wholesaler
                          </SelectItem>
                          <SelectItem value='IMPORTER'>Importer</SelectItem>
                          <SelectItem value='LOCAL_VENDOR'>Local Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='companyRegNo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter registration number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            {/* Contact Information */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-muted-foreground'>Contact Information</h3>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='Enter email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter phone' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder='https://' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='fax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fax</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter fax' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            {/* Address */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-muted-foreground'>Address</h3>
              <FormField
                control={form.control}
                name='addressLine1'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder='Street address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='addressLine2'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder='Unit, etc.' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder='City' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder='State' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder='Country' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder='Postal Code' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            {/* Financial */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-muted-foreground'>Financial Information</h3>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='paymentTerms'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select terms' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='NET_15'>Net 15</SelectItem>
                          <SelectItem value='NET_30'>Net 30</SelectItem>
                          <SelectItem value='NET_45'>Net 45</SelectItem>
                          <SelectItem value='NET_60'>Net 60</SelectItem>
                          <SelectItem value='DUE_ON_RECEIPT'>Due on Receipt</SelectItem>
                          <SelectItem value='ADVANCE'>Advance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='creditPeriod'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Period (Days)</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='e.g. 30' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. USD' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='taxId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input placeholder='Tax ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='panNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN</FormLabel>
                      <FormControl>
                        <Input placeholder='PAN' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='bankDetails'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Bank Name, Account No, IBAN, Swift Code...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            {/* Supply & Quality */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-muted-foreground'>Supply & Quality</h3>
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='leadTimeDays'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Time (Days)</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='e.g. 7' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='minOrderQty'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Order Qty</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Qty' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='minOrderValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Order Value</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Value' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='qualityRating'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality Rating</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select rating' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='EXCELLENT'>Excellent</SelectItem>
                          <SelectItem value='GOOD'>Good</SelectItem>
                          <SelectItem value='AVERAGE'>Average</SelectItem>
                          <SelectItem value='POOR'>Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='complianceStatus'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='COMPLIANT'>Compliant</SelectItem>
                          <SelectItem value='NON_COMPLIANT'>Non-Compliant</SelectItem>
                          <SelectItem value='PENDING'>Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            {/* Additional */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium text-muted-foreground'>Additional Information</h3>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='supplierCategory'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='PREFERRED'>Preferred</SelectItem>
                          <SelectItem value='APPROVED'>Approved</SelectItem>
                          <SelectItem value='TRIAL'>Trial</SelectItem>
                          <SelectItem value='BLACKLISTED'>Blacklisted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='assignedManager'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Manager</FormLabel>
                      <FormControl>
                        <Input placeholder='Manager name' {...field} />
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
                      <Textarea placeholder='Additional notes...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <div className='flex gap-2 flex-wrap'>
                          {field.value?.map((tag: string) => (
                            <Badge key={tag} variant='secondary' className='gap-1'>
                              {tag}
                              <X
                                className='h-3 w-3 cursor-pointer hover:text-destructive'
                                onClick={() => handleRemoveTag(tag, field)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder='Add tags (Press Enter)'
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => handleAddTag(e, field)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Active Supplier</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {initialData ? 'Update Supplier' : 'Create Supplier'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
