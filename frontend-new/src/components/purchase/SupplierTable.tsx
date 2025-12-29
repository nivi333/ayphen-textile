import { MoreHorizontal, Edit, Trash2, Eye, ShoppingCart, FileText } from 'lucide-react';
import {
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatusBadge,
  IconButton,
} from '@/components/globalComponents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Supplier } from '@/services/supplierService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onCreatePO: (supplier: Supplier) => void;
  onViewPOs: (supplier: Supplier) => void;
  userRole?: string;
}

export function SupplierTable({
  suppliers,
  loading,
  onEdit,
  onDelete,
  onCreatePO,
  onViewPOs,
  userRole,
}: SupplierTableProps) {
  const isEmployee = userRole === 'EMPLOYEE';

  const getSupplierTypeBadgeColor = (type: string) => {
    const map: Record<string, string> = {
      MANUFACTURER: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      DISTRIBUTOR: 'bg-green-100 text-green-800 hover:bg-green-100',
      WHOLESALER: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      IMPORTER: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      LOCAL_VENDOR: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
    };
    return map[type] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  if (loading && suppliers.length === 0) {
    return <div className='p-4 text-center text-muted-foreground'>Loading suppliers...</div>;
  }

  return (
    <DataTable>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead className='w-[250px]'>Supplier Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Lead Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className='w-[80px]'></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map(supplier => (
          <TableRow key={supplier.id}>
            <TableCell className='font-mono text-xs'>{supplier.code}</TableCell>
            <TableCell>
              <div className='flex items-center gap-3'>
                <Avatar className='h-9 w-9 bg-pink-600'>
                  <AvatarFallback className='bg-[#df005c] text-white'>
                    {supplier.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col overflow-hidden'>
                  <span className='font-medium truncate'>{supplier.name}</span>
                  {supplier.companyRegNo && (
                    <span className='text-xs text-muted-foreground truncate'>
                      Reg: {supplier.companyRegNo}
                    </span>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className='truncate max-w-[150px]' title={supplier.email}>
                {supplier.email || '—'}
              </div>
            </TableCell>
            <TableCell>
              <div className='truncate max-w-[120px]'>{supplier.phone || '—'}</div>
            </TableCell>
            <TableCell>
              <Badge
                variant='outline'
                className={cn(
                  'capitalize border-0',
                  getSupplierTypeBadgeColor(supplier.supplierType)
                )}
              >
                {supplier.supplierType?.replace('_', ' ').toLowerCase() || '—'}
              </Badge>
            </TableCell>
            <TableCell>{supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : '—'}</TableCell>
            <TableCell>
              <StatusBadge variant={supplier.isActive ? 'success' : 'default'}>
                {supplier.isActive ? 'Active' : 'Inactive'}
              </StatusBadge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton variant='ghost' className='h-8 w-8 p-0'>
                    <MoreHorizontal className='h-4 w-4' />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(supplier)}>
                    <Eye className='mr-2 h-4 w-4' /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(supplier)} disabled={isEmployee}>
                    <Edit className='mr-2 h-4 w-4' /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onCreatePO(supplier)} disabled={isEmployee}>
                    <ShoppingCart className='mr-2 h-4 w-4' /> Create PO
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewPOs(supplier)}>
                    <FileText className='mr-2 h-4 w-4' /> View POs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(supplier)}
                    disabled={isEmployee}
                    className='text-destructive focus:text-destructive'
                  >
                    <Trash2 className='mr-2 h-4 w-4' /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {!loading && suppliers.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className='h-24 text-center'>
              No suppliers found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </DataTable>
  );
}
