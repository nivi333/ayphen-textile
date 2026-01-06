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
import { Badge } from '@/components/ui/badge';
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
  designPatternService,
  DesignPattern,
  DESIGN_CATEGORIES,
  DESIGN_STATUSES,
} from '@/services/textileService';
import { DesignPatternSheet } from '@/components/textile/DesignPatternSheet';
import { toast } from 'sonner';

export const DesignPatternsListPage = () => {
  const [data, setData] = useState<DesignPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<DesignPattern | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await designPatternService.getDesignPatterns();
      let filtered = response;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.designName.toLowerCase().includes(query) ||
            item.designerName?.toLowerCase().includes(query)
        );
      }

      if (categoryFilter !== 'all') {
        filtered = filtered.filter(item => item.designCategory === categoryFilter);
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(item => item.status === statusFilter);
      }

      setData(filtered);
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast.error('Failed to load design patterns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, categoryFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await designPatternService.deleteDesignPattern(deleteId);
      toast.success('Design pattern deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting design:', error);
      toast.error('Failed to delete design pattern');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Design Patterns</PageTitle>
          <p className='text-muted-foreground text-sm mt-1'>
            Manage textile design conceptualization, patterns, and approvals.
          </p>
        </div>
        <PrimaryButton
          onClick={() => {
            setSelectedDesign(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          New Design
        </PrimaryButton>
      </PageHeader>

      <ActionBar>
        <SearchInput
          placeholder='Search designs...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />
        <div className='flex gap-2'>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='w-[150px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue placeholder='Filter by Category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {DESIGN_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[150px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue placeholder='Filter by Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              {DESIGN_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
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
            searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No design patterns found'
          }
          action={
            <PrimaryButton
              onClick={() => {
                setSelectedDesign(undefined);
                setSheetOpen(true);
              }}
            >
              Create Design
            </PrimaryButton>
          }
        />
      ) : (
        <DataTable>
          <TableHeader>
            <TableRow>
              {/* Temporarily manually rendering headers as the previous columns abstraction is removed */}
              <TableHead>Code</TableHead>
              <TableHead>Design Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Designer</TableHead>
              <TableHead>Colors</TableHead>
              <TableHead>Design Status</TableHead>
              <TableHead>Active</TableHead>
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
                    <span className='font-medium'>{row.designName}</span>
                    <span className='text-xs text-muted-foreground'>
                      {row.season || 'No season'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const cat = DESIGN_CATEGORIES.find(c => c.value === row.designCategory);
                    return <span>{cat?.label || row.designCategory}</span>;
                  })()}
                </TableCell>
                <TableCell>
                  <span>{row.designerName || '-'}</span>
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    {row.colorPalette?.slice(0, 3).map(color => (
                      <Badge key={color} variant='outline' className='text-[10px] px-1 py-0 h-5'>
                        {color}
                      </Badge>
                    ))}
                    {(row.colorPalette?.length || 0) > 3 && (
                      <Badge variant='outline' className='text-[10px] px-1 py-0 h-5'>
                        +{row.colorPalette!.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const status = DESIGN_STATUSES.find(s => s.value === row.status);
                    let variant: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default';

                    switch (row.status) {
                      case 'APPROVED':
                        variant = 'success';
                        break;
                      case 'IN_DEVELOPMENT':
                        variant = 'warning';
                        break;
                      case 'ARCHIVED':
                        variant = 'default'; // neutral -> default
                        break;
                      default:
                        variant = 'info';
                    }

                    return <StatusBadge variant={variant} children={status?.label || row.status} />;
                  })()}
                </TableCell>
                <TableCell>
                  <StatusBadge variant={row.isActive ? 'success' : 'default'}>
                    {row.isActive ? 'Yes' : 'No'}
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
                          setSelectedDesign(row);
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

      <DesignPatternSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={fetchData}
        design={selectedDesign}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the design pattern.
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

export default DesignPatternsListPage;
