import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';
import { PageContainer, PageHeader, PageTitle, Card } from '@/components/globalComponents';
import useAuth from '@/contexts/AuthContext';

const QualityReportsPage = () => {
  const { currentCompany } = useAuth();
  const [stats, setStats] = useState({
    totalInspections: 0,
    passedInspections: 0,
    failedInspections: 0,
    passRate: 0,
  });

  useEffect(() => {
    if (currentCompany) {
      fetchReports();
    }
  }, [currentCompany]);

  const fetchReports = async () => {
    try {
      // TODO: Implement quality reports service integration
      // const data = await qualityReportsService.getReports();

      // Placeholder data
      setStats({
        totalInspections: 0,
        passedInspections: 0,
        failedInspections: 0,
        passRate: 0,
      });
    } catch (error: any) {
      console.error('Error fetching quality reports:', error);
      toast.error(error.message || 'Failed to fetch quality reports');
    }
  };

  if (!currentCompany) {
    return (
      <PageContainer>
        <div className='text-center text-muted-foreground'>
          Please select a company to view quality reports.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Quality Reports</PageTitle>
      </PageHeader>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-primary mb-1'>{stats.totalInspections}</p>
              <p className='text-sm text-muted-foreground'>Total Inspections</p>
            </div>
            <DollarSign className='h-5 w-5 text-primary' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-success mb-1'>{stats.passedInspections}</p>
              <p className='text-sm text-muted-foreground'>Passed Inspections</p>
            </div>
            <DollarSign className='h-5 w-5 text-success' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-error mb-1'>{stats.failedInspections}</p>
              <p className='text-sm text-muted-foreground'>Failed Inspections</p>
            </div>
            <DollarSign className='h-5 w-5 text-error' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-info mb-1'>{stats.passRate.toFixed(1)}%</p>
              <p className='text-sm text-muted-foreground'>Pass Rate</p>
            </div>
            <DollarSign className='h-5 w-5 text-info' />
          </div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Card>
          <h3 className='font-semibold mb-4'>Quality Score Trend</h3>
          <div className='flex items-center justify-center h-[300px] text-muted-foreground'>
            Chart placeholder - Recharts integration pending
          </div>
        </Card>

        <Card>
          <h3 className='font-semibold mb-4'>Defects by Category</h3>
          <div className='flex items-center justify-center h-[300px] text-muted-foreground'>
            Chart placeholder - Recharts integration pending
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default QualityReportsPage;
