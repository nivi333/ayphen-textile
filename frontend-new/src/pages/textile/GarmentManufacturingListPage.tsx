import { useEffect, useState } from 'react';
import { Plus, Filter, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import {
  PageContainer,
  PageHeader,
  PageTitle,
  ActionBar,
  SearchInput,
  PrimaryButton,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatusBadge,
  IconButton,
  EmptyState,
} from '@/components/globalComponents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  garmentManufacturingService,
  GarmentManufacturing,
  GARMENT_TYPES,
  PRODUCTION_STAGES,
} from '@/services/textileService';
import { GarmentManufacturingSheet } from '@/components/textile/GarmentManufacturingSheet';
import { toast } from 'sonner';

export const GarmentManufacturingListPage = () => {
  const [data, setData] = useState<GarmentManufacturing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState<GarmentManufacturing | undefined>(
    undefined
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await garmentManufacturingService.getGarmentManufacturing();
      let filtered = response;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.styleNumber.toLowerCase().includes(query) ||
            item.operatorName?.toLowerCase().includes(query)
        );
      }

      if (typeFilter !== 'all') {
        filtered = filtered.filter(item => item.garmentType === typeFilter);
      }

      if (stageFilter !== 'all') {
        filtered = filtered.filter(item => item.productionStage === stageFilter);
      }

      setData(filtered);
    } catch (error) {
      console.error('Error fetching garments:', error);
      toast.error('Failed to load garment manufacturing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, typeFilter, stageFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await garmentManufacturingService.deleteGarmentManufacturing(deleteId);
      toast.success('Garment record deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting garment:', error);
      toast.error('Failed to delete garment record');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Garment Manufacturing</PageTitle>
          <p className='text-muted-foreground text-sm mt-1'>
            Track garment production stages from cutting to packing.
          </p>
        </div>
        <PrimaryButton
          onClick={() => {
            setSelectedGarment(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          New Garment
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <SearchInput
          placeholder='Search style, code...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />
        <div className='flex gap-2'>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-[150px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue placeholder='Filter by Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              {GARMENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className='w-[150px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue placeholder='Filter by Stage' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Stages</SelectItem>
              {PRODUCTION_STAGES.map(stage => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ActionBar>

      {loading ? (
        <div className='flex justify-center p-8'>Loading...</div>
      ) : data.length === 0 ? (
        <EmptyState
          message={
            searchQuery || typeFilter !== 'all' || stageFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No garment manufacturing records found'
          }
          action={
            <PrimaryButton
              onClick={() => {
                setSelectedGarment(undefined);
                setSheetOpen(true);
              }}
            >
              Create Garment
            </PrimaryButton>
          }
        />
      ) : (
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Specs</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>QC Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className='font-mono text-xs'>{row.id.substring(0, 8)}</span>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{row.styleNumber}</span>
                    <span className='text-xs text-muted-foreground'>{row.garmentType}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span>
                    {row.size} - {row.color}
                  </span>
                </TableCell>
                <TableCell>
                  <span>{row.quantity}</span>
                </TableCell>
                <TableCell>
                  {(() => {
                    const stage = PRODUCTION_STAGES.find(s => s.value === row.productionStage);
                    return (
                      <StatusBadge variant='info' children={stage?.label || row.productionStage} />
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <StatusBadge variant={row.qualityPassed ? 'success' : 'warning'}>
                    {row.qualityPassed ? 'Passed' : 'Pending'}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={row.isActive ? 'success' : 'default'}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton variant='ghost'>
                        <MoreHorizontal className='h-4 w-4' />
                      </IconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGarment(row);
                          setSheetOpen(true);
                        }}
                      >
                        <Pencil className='mr-2 h-4 w-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-red-600 focus:text-red-600'
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      )}

      <GarmentManufacturingSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={fetchData}
        garment={selectedGarment}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the garment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-red-600 hover:bg-red-700'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default GarmentManufacturingListPage;
