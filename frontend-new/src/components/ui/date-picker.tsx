'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Pick a date',
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setOpen(false); // Auto-close when date is selected
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!date}
          className={cn(
            'w-[240px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={handleSelect}
          disabled={disabled}
          captionLayout='dropdown'
          fromYear={1800}
          toYear={2030}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
