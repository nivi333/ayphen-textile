import { LayoutDashboard } from 'lucide-react';

const PlaceholderPage = () => (
  <div className='flex items-center justify-center min-h-[50vh] text-muted-foreground p-8'>
    <div className='text-center'>
      <div className='mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 p-4'>
        <LayoutDashboard className='h-8 w-8 text-accent-foreground/50' />
      </div>
      <h2 className='text-xl font-semibold mb-2'>Coming Soon</h2>
      <p>This page is currently being migrated.</p>
    </div>
  </div>
);

export default PlaceholderPage;
