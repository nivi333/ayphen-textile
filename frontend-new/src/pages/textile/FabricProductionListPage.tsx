import { useEffect, useState } from 'react';
import { Plus, Filter, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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
  fabricProductionService,
  FabricProduction,
  FABRIC_TYPES,
  QUALITY_GRADES,
} from '@/services/textileService';
import { FabricProductionSheet } from '@/components/textile/FabricProductionSheet';
import { toast } from 'sonner';

export const FabricProductionListPage = () => {
  const [data, setData] = useState<FabricProduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<FabricProduction | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fabricProductionService.getFabricProductions();
      let filtered = response;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.fabricName.toLowerCase().includes(query) ||
            item.batchNumber.toLowerCase().includes(query)
        );
      }

      if (typeFilter !== 'all') {
        filtered = filtered.filter(item => item.fabricType === typeFilter);
      }

      if (gradeFilter !== 'all') {
        filtered = filtered.filter(item => item.qualityGrade === gradeFilter);
      }

      setData(filtered);
    } catch (error) {
      console.error('Error fetching fabrics:', error);
      toast.error('Failed to load fabric production data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, typeFilter, gradeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fabricProductionService.deleteFabricProduction(deleteId);
      toast.success('Fabric production record deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting fabric:', error);
      toast.error('Failed to delete fabric record');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Fabric Production</PageTitle>
          <p className='text-muted-foreground text-sm mt-1'>
            Manage fabric production batches, inventory, and quality grading.
          </p>
        </div>
        <PrimaryButton
          onClick={() => {
            setSelectedFabric(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          New Production
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <SearchInput
          placeholder='Search fabrics...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />
        <div className='flex gap-2'>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-[180px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue placeholder='Filter by Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              {FABRIC_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className='w-[150px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue placeholder='Filter by Grade' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Grades</SelectItem>
              {QUALITY_GRADES.map(grade => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
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
            searchQuery || typeFilter !== 'all' || gradeFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No fabric production records found'
          }
          action={
            <PrimaryButton
              onClick={() => {
                setSelectedFabric(undefined);
                setSheetOpen(true);
              }}
            >
              Create Production
            </PrimaryButton>
          }
        />
      ) : (
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Fabric Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className='font-mono text-xs'>
                    {row.batchNumber || row.id.substring(0, 8)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{row.fabricName}</span>
                    <span className='text-xs text-muted-foreground'>{row.composition}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const type = FABRIC_TYPES.find(t => t.value === row.fabricType);
                    return <span>{type?.label || row.fabricType}</span>;
                  })()}
                </TableCell>
                <TableCell>
                  <span>{row.quantityMeters.toLocaleString()} m</span>
                </TableCell>
                <TableCell>
                  {(() => {
                    const grade = QUALITY_GRADES.find(g => g.value === row.qualityGrade);
                    return (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700`}
                      >
                        {grade?.label || row.qualityGrade}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <span className='text-muted-foreground'>
                    {format(new Date(row.productionDate), 'MMM d, yyyy')}
                  </span>
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
                          setSelectedFabric(row);
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

      <FabricProductionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={fetchData}
        fabric={selectedFabric}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the fabric production
              record.
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

export default FabricProductionListPage;
