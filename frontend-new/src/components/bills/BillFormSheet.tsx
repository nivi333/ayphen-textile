import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface BillFormSheetProps {
  open: boolean;
  onClose: () => void;
  initialData?: any | null;
}

export function BillFormSheet({ open, onClose, initialData }: BillFormSheetProps) {
  // TODO: Implement full bill form with react-hook-form + zod
  // This is a placeholder that will be implemented in the next step

  return (
    <Sheet open={open} onOpenChange={val => !val && onClose()}>
      <SheetContent className='w-[720px] sm:max-w-[720px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>{initialData ? 'Edit Bill' : 'Create Bill'}</SheetTitle>
        </SheetHeader>
        <div className='py-6'>
          <p className='text-sm text-muted-foreground'>Bill form implementation in progress...</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
