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
  yarnManufacturingService,
  YarnManufacturing,
  YARN_TYPES,
  QUALITY_GRADES,
} from '@/services/textileService';
import { YarnManufacturingSheet } from '@/components/textile/YarnManufacturingSheet';
import { toast } from 'sonner';

export const YarnManufacturingListPage = () => {
  const [data, setData] = useState<YarnManufacturing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedYarn, setSelectedYarn] = useState<YarnManufacturing | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await yarnManufacturingService.getYarnManufacturing();
      let filtered = response;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.yarnName.toLowerCase().includes(query) ||
            item.batchNumber.toLowerCase().includes(query)
        );
      }

      if (typeFilter !== 'all') {
        filtered = filtered.filter(item => item.yarnType === typeFilter);
      }

      if (gradeFilter !== 'all') {
        filtered = filtered.filter(item => item.qualityGrade === gradeFilter);
      }

      setData(filtered);
    } catch (error) {
      console.error('Error fetching yarn data:', error);
      toast.error('Failed to load yarn manufacturing data');
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
      await yarnManufacturingService.deleteYarnManufacturing(deleteId);
      toast.success('Yarn manufacturing record deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting yarn:', error);
      toast.error('Failed to delete yarn record');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Yarn Manufacturing</PageTitle>
          <p className='text-muted-foreground text-sm mt-1'>
            Track yarn production, spinning processes, and inventory.
          </p>
        </div>
        <PrimaryButton
          onClick={() => {
            setSelectedYarn(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          New Yarn
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <SearchInput
          placeholder='Search yarns...'
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
              {YARN_TYPES.map(type => (
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
              : 'No yarn manufacturing records found'
          }
          action={
            <PrimaryButton
              onClick={() => {
                setSelectedYarn(undefined);
                setSheetOpen(true);
              }}
            >
              Create Yarn
            </PrimaryButton>
          }
        />
      ) : (
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Yarn Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Count</TableHead>
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
                  <span className='font-mono text-xs bg-muted px-2 py-1 rounded'>
                    {row.code || row.yarnId || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{row.yarnName}</span>
                    <span className='text-xs text-muted-foreground'>{row.fiberContent}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const type = YARN_TYPES.find(t => t.value === row.yarnType);
                    return <span>{type?.label || row.yarnType}</span>;
                  })()}
                </TableCell>
                <TableCell>
                  <span>{row.yarnCount}</span>
                </TableCell>
                <TableCell>
                  <span>{row.quantityKg.toLocaleString()} kg</span>
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
                          setSelectedYarn(row);
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

      <YarnManufacturingSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={fetchData}
        yarn={selectedYarn}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the yarn manufacturing
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

export default YarnManufacturingListPage;
