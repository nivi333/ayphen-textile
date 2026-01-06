import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ value, onChange, disabled, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        onClick={handleClick}
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          'border-muted-foreground/25 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
          value ? 'border-none p-0' : 'p-6'
        )}
      >
        <input
          type='file'
          ref={inputRef}
          className='hidden'
          accept='image/*'
          onChange={handleFileChange}
          disabled={disabled}
        />

        {value ? (
          <div className='relative w-full h-full group'>
            <img src={value} alt='Upload' className='w-full h-full object-contain rounded-lg' />
            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg'>
              <Button
                type='button'
                variant='destructive'
                size='icon'
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center text-center'>
            <div className='p-2 bg-muted rounded-full mb-2'>
              {/* Used ImageIcon here simply to use the import if needed, or stick to Upload */}
              <Upload className='h-5 w-5 text-muted-foreground' />
            </div>
            <p className='text-sm text-muted-foreground font-medium'>Click to upload image</p>
            <p className='text-xs text-muted-foreground mt-1'>SVG, PNG, JPG or GIF (max. 2MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}
