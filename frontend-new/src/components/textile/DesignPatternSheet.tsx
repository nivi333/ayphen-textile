import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, X } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

import {
  designPatternService,
  DesignPattern,
  CreateDesignPatternData,
  DESIGN_CATEGORIES,
  DESIGN_STATUSES,
} from '@/services/textileService';

const designSchema = z.object({
  designName: z.string().min(1, 'Design name is required'),
  designCategory: z.string().min(1, 'Category is required'),
  season: z.string().optional(),
  patternRepeat: z.string().optional(),
  designerName: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  sampleImageUrl: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DesignFormValues = z.infer<typeof designSchema>;

interface DesignPatternSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  design?: DesignPattern;
}

export function DesignPatternSheet({
  open,
  onOpenChange,
  onSuccess,
  design,
}: DesignPatternSheetProps) {
  const [loading, setLoading] = useState(false);
  const [colorInput, setColorInput] = useState('');
  const [colorPalette, setColorPalette] = useState<string[]>([]);

  const isEditing = !!design;

  const form = useForm({
    resolver: zodResolver(designSchema),
    defaultValues: {
      isActive: true,
      status: 'CONCEPT',
    },
  });

  useEffect(() => {
    if (open) {
      if (design) {
        form.reset({
          designName: design.designName,
          designCategory: design.designCategory,
          season: design.season || '',
          patternRepeat: design.patternRepeat || '',
          designerName: design.designerName || '',
          status: design.status,
          sampleImageUrl: design.sampleImageUrl || '',
          notes: design.notes || '',
          isActive: design.isActive,
        });
        setColorPalette(design.colorPalette || []);
      } else {
        form.reset({
          isActive: true,
          status: 'CONCEPT',
          season: '',
          patternRepeat: '',
          designerName: '',
          sampleImageUrl: '',
          notes: '',
        });
        setColorPalette([]);
      }
    }
  }, [open, design, form]);

  const handleAddColor = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (colorInput && !colorPalette.includes(colorInput)) {
      setColorPalette([...colorPalette, colorInput]);
      setColorInput('');
    }
  };

  const handleRemoveColor = (color: string) => {
    setColorPalette(colorPalette.filter(c => c !== color));
  };

  const onSubmit = async (values: DesignFormValues) => {
    setLoading(true);
    try {
      const payload: CreateDesignPatternData = {
        ...values,
        colorPalette,
      };

      if (isEditing && design) {
        await designPatternService.updateDesignPattern(design.id, payload);
        toast.success('Design pattern updated successfully');
      } else {
        await designPatternService.createDesignPattern(payload);
        toast.success('Design pattern created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving design:', error);
      toast.error(error.message || 'Failed to save design pattern');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[720px] sm:max-w-[720px] overflow-y-auto'>
        <SheetHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <SheetTitle>{isEditing ? 'Edit Design Pattern' : 'New Design Pattern'}</SheetTitle>
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

              <FormField
                control={form.control}
                name='sampleImageUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Design Image</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Code</label>
                <Input 
                  value={isEditing && design?.code ? design.code : ''} 
                  placeholder='Auto generated' 
                  disabled 
                  className='bg-muted' 
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='designName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Design Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter design name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='designCategory'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DESIGN_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
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
                          {DESIGN_STATUSES.map(status => (
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
                <FormField
                  control={form.control}
                  name='designerName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designer Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter designer name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='h-px bg-border' />

            {/* Design Details */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Design Details</h3>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='season'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Spring 2024' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='patternRepeat'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pattern Repeat</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., 12x12 cm' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Color Palette</label>
                <div className='flex gap-2 mb-2'>
                  <Input
                    value={colorInput}
                    onChange={e => setColorInput(e.target.value)}
                    placeholder='Enter color name or hex'
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor(e);
                      }
                    }}
                  />
                  <Button type='button' onClick={handleAddColor} size='icon' variant='outline'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {colorPalette.map(color => (
                    <Badge key={color} variant='secondary' className='pl-2 pr-1'>
                      {color}
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => handleRemoveColor(color)}
                        className='h-4 w-4 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground'
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </Badge>
                  ))}
                  {colorPalette.length === 0 && (
                    <span className='text-sm text-muted-foreground'>No colors added</span>
                  )}
                </div>
              </div>
            </div>

            <div className='h-px bg-border' />

            {/* Additional Info */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Additional Information</h3>
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Any additional notes...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className='pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEditing ? 'Save Changes' : 'Create Design'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
