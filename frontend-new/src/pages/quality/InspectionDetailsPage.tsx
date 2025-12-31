import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Printer, Edit, Trash2 } from 'lucide-react';
import {
  PageContainer,
  Card,
  StatusBadge,
  PrimaryButton,
  LoadingSpinner,
  EmptyState,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/globalComponents';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { inspectionService, InspectionDetail } from '@/services/inspectionService';
import { format } from 'date-fns';

type InspectionType = 'INCOMING_MATERIAL' | 'IN_PROCESS' | 'FINAL_PRODUCT' | 'RANDOM_CHECK';
type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CONDITIONAL';

const TYPE_COLORS: Record<InspectionType, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  INCOMING_MATERIAL: 'info',
  IN_PROCESS: 'warning',
  FINAL_PRODUCT: 'success',
  RANDOM_CHECK: 'default',
};

const STATUS_COLORS: Record<
  InspectionStatus,
  'default' | 'success' | 'warning' | 'error' | 'info'
> = {
  PENDING: 'default',
  IN_PROGRESS: 'info',
  PASSED: 'success',
  FAILED: 'error',
  CONDITIONAL: 'warning',
};

const InspectionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInspection();
    }
  }, [id]);

  const fetchInspection = async () => {
    try {
      setLoading(true);
      const data = await inspectionService.getInspectionById(id!);
      setInspection(data);
    } catch (error: any) {
      console.error('Error fetching inspection:', error);
      toast.error(error.message || 'Failed to fetch inspection');
      navigate('/inspections');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await inspectionService.deleteInspection(id!);
      toast.success('Inspection deleted successfully');
      navigate('/inspections');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete inspection');
    }
  };

  const handleEdit = () => {
    toast.info('Edit inspection functionality');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center min-h-[400px]'>
          <LoadingSpinner />
        </div>
      </PageContainer>
    );
  }

  if (!inspection) {
    return (
      <PageContainer>
        <EmptyState message='Inspection not found' />
      </PageContainer>
    );
  }

  const inspectorName =
    inspection.inspectorName ||
    (inspection.inspector
      ? `${inspection.inspector.firstName} ${inspection.inspector.lastName}`
      : '-');

  return (
    <PageContainer>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' onClick={() => navigate('/inspections')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back
          </Button>
          <h1 className='text-2xl font-bold'>{inspection.inspectionNumber}</h1>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={handlePrint}>
            <Printer className='h-4 w-4 mr-2' />
            Print
          </Button>
          <PrimaryButton size='sm' onClick={handleEdit}>
            <Edit className='h-4 w-4 mr-2' />
            Edit
          </PrimaryButton>
          <Button variant='destructive' size='sm' onClick={handleDelete}>
            <Trash2 className='h-4 w-4 mr-2' />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className='flex flex-wrap gap-4 mb-6 p-4 bg-muted rounded-lg'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Type:</span>
          <StatusBadge variant={TYPE_COLORS[inspection.inspectionType]}>
            {inspection.inspectionType.replace(/_/g, ' ')}
          </StatusBadge>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Status:</span>
          <StatusBadge variant={STATUS_COLORS[inspection.status]}>
            {inspection.status.replace(/_/g, ' ')}
          </StatusBadge>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Quality Score:</span>
          <span className='font-medium'>
            {inspection.qualityScore !== undefined && inspection.qualityScore !== null
              ? `${Number(inspection.qualityScore).toFixed(1)}%`
              : '-'}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Created:</span>
          <span className='font-medium'>{format(new Date(inspection.createdAt), 'PPP')}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='overview'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='checkpoints'>
            Checkpoints ({inspection.checkpoints?.length || 0})
          </TabsTrigger>
          <TabsTrigger value='notes'>Notes & Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='mt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <h3 className='font-semibold mb-4'>Inspection Information</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Inspection Code:</span>
                  <span className='font-medium'>{inspection.inspectionNumber}</span>
                </div>
                <Separator />
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Type:</span>
                  <span className='font-medium'>
                    {inspection.inspectionType.replace(/_/g, ' ')}
                  </span>
                </div>
                <Separator />
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Status:</span>
                  <StatusBadge variant={STATUS_COLORS[inspection.status]}>
                    {inspection.status.replace(/_/g, ' ')}
                  </StatusBadge>
                </div>
                <Separator />
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Scheduled Date:</span>
                  <span className='font-medium'>
                    {format(new Date(inspection.scheduledDate), 'dd MMM yyyy')}
                  </span>
                </div>
                {inspection.inspectionDate && (
                  <>
                    <Separator />
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Inspection Date:</span>
                      <span className='font-medium'>
                        {format(new Date(inspection.inspectionDate), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <h3 className='font-semibold mb-4'>Reference Information</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Reference Type:</span>
                  <span className='font-medium'>{inspection.referenceType}</span>
                </div>
                <Separator />
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Reference ID:</span>
                  <span className='font-medium'>{inspection.referenceId}</span>
                </div>
                <Separator />
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Inspector:</span>
                  <span className='font-medium'>{inspectorName}</span>
                </div>
                <Separator />
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Quality Score:</span>
                  <span className='font-medium'>
                    {inspection.qualityScore !== undefined && inspection.qualityScore !== null
                      ? `${Number(inspection.qualityScore).toFixed(1)}%`
                      : '-'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='checkpoints' className='mt-6'>
          {inspection.checkpoints && inspection.checkpoints.length > 0 ? (
            <Card>
              <DataTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Checkpoint</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspection.checkpoints.map(checkpoint => (
                    <TableRow key={checkpoint.id}>
                      <TableCell className='font-semibold'>{checkpoint.name}</TableCell>
                      <TableCell>
                        <StatusBadge variant='default'>{checkpoint.evaluationType}</StatusBadge>
                      </TableCell>
                      <TableCell>{checkpoint.result || '-'}</TableCell>
                      <TableCell className='truncate max-w-[300px]'>
                        {checkpoint.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </DataTable>
            </Card>
          ) : (
            <EmptyState message='No checkpoints found' />
          )}
        </TabsContent>

        <TabsContent value='notes' className='mt-6'>
          <div className='grid grid-cols-1 gap-4'>
            <Card>
              <h3 className='font-semibold mb-4'>Inspector Notes</h3>
              <p className='text-muted-foreground whitespace-pre-wrap'>
                {inspection.inspectorNotes || 'No notes provided'}
              </p>
            </Card>
            <Card>
              <h3 className='font-semibold mb-4'>Recommendations</h3>
              <p className='text-muted-foreground whitespace-pre-wrap'>
                {inspection.recommendations || 'No recommendations provided'}
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default InspectionDetailsPage;
