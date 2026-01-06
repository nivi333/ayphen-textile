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
  dyeingFinishingService,
  DyeingFinishing,
  DYEING_PROCESSES,
} from '@/services/textileService';
import { DyeingFinishingSheet } from '@/components/textile/DyeingFinishingSheet';
import { toast } from 'sonner';

export const DyeingFinishingListPage = () => {
  const [data, setData] = useState<DyeingFinishing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<DyeingFinishing | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await dyeingFinishingService.getDyeingFinishing();
      let filtered = response;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.colorName.toLowerCase().includes(query) ||
            item.batchNumber.toLowerCase().includes(query)
        );
      }

      if (typeFilter !== 'all') {
        filtered = filtered.filter(item => item.processType === typeFilter);
      }

      setData(filtered);
    } catch (error) {
      console.error('Error fetching dyeing processes:', error);
      toast.error('Failed to load dyeing & finishing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, typeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dyeingFinishingService.deleteDyeingFinishing(deleteId);
      toast.success('Process record deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting process:', error);
      toast.error('Failed to delete process record');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Dyeing & Finishing</PageTitle>
          <p className='text-muted-foreground text-sm mt-1'>
            Manage dyeing processes, finishing treatments, and color quality.
          </p>
        </div>
        <PrimaryButton
          onClick={() => {
            setSelectedProcess(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          New Process
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <SearchInput
          placeholder='Search processes...'
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
              {DYEING_PROCESSES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
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
            searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No processes found'
          }
          action={
            <PrimaryButton
              onClick={() => {
                setSelectedProcess(undefined);
                setSheetOpen(true);
              }}
            >
              New Process
            </PrimaryButton>
          }
        />
      ) : (
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Process Type</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Quality Check</TableHead>
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
                  {(() => {
                    const type = DYEING_PROCESSES.find(t => t.value === row.processType);
                    return <span>{type?.label || row.processType}</span>;
                  })()}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-6 w-6 rounded-full border shadow-sm'
                      style={{ backgroundColor: row.colorCode }}
                    />
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium'>{row.colorName}</span>
                      <span className='text-[10px] text-muted-foreground'>{row.colorCode}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span>{row.quantityMeters.toLocaleString()} m</span>
                </TableCell>
                <TableCell>
                  <span className='text-muted-foreground'>
                    {format(new Date(row.processDate), 'MMM d, yyyy')}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={row.qualityCheck ? 'success' : 'warning'}>
                    {row.qualityCheck ? 'Passed' : 'Pending'}
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
                          setSelectedProcess(row);
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

      <DyeingFinishingSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={fetchData}
        process={selectedProcess}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the process record.
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

export default DyeingFinishingListPage;
