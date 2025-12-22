/**
 * Dashboard Page
 * Main dashboard view after login
 */

import { PageContainer, PageHeader, PageTitle } from '@/components/globalComponents';
import useAuth from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, currentCompany } = useAuth();

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
      </PageHeader>

      <div className='space-y-6'>
        {/* Welcome Message */}
        <div className='rounded-base border bg-card p-6'>
          <h2 className='text-xl font-semibold mb-2'>
            Welcome back, {user?.firstName} {user?.lastName}!
          </h2>
          <p className='text-muted-foreground'>
            {currentCompany ? (
              <>
                Currently viewing:{' '}
                <span className='font-medium text-foreground'>{currentCompany.name}</span>
              </>
            ) : (
              'Select a company to get started'
            )}
          </p>
        </div>

        {/* Placeholder Content */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-base border bg-card p-6'>
            <h3 className='font-semibold mb-2'>Quick Stats</h3>
            <p className='text-sm text-muted-foreground'>Dashboard content coming soon...</p>
          </div>

          <div className='rounded-base border bg-card p-6'>
            <h3 className='font-semibold mb-2'>Recent Activity</h3>
            <p className='text-sm text-muted-foreground'>Activity feed coming soon...</p>
          </div>

          <div className='rounded-base border bg-card p-6'>
            <h3 className='font-semibold mb-2'>Notifications</h3>
            <p className='text-sm text-muted-foreground'>Notifications coming soon...</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
