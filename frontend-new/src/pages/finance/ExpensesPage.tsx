import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DollarSign, MoreVertical, Home, Loader2, Plus } from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  Card,
  StatusBadge,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  PrimaryButton,
  EmptyState,
  TextInput,
  TextArea,
  Label,
} from '@/components/globalComponents';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  expenseService,
  ExpenseSummary,
  ExpenseStatus,
  ExpenseCategory,
  CreateExpenseRequest,
} from '@/services/expenseService';
import useAuth from '@/contexts/AuthContext';

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  expenseDate: z.date(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  paymentMethod: z.string().optional(),
  paymentDate: z.date().optional(),
  employeeName: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const STATUS_COLORS: Record<ExpenseStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  PAID: 'success',
  CANCELLED: 'error',
};

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Rent',
  UTILITIES: 'Utilities',
  SALARIES: 'Salaries',
  EQUIPMENT: 'Equipment',
  SUPPLIES: 'Supplies',
  MAINTENANCE: 'Maintenance',
  TRAVEL: 'Travel',
  MARKETING: 'Marketing',
  INSURANCE: 'Insurance',
  TAXES: 'Taxes',
  RAW_MATERIALS: 'Raw Materials',
  SHIPPING: 'Shipping',
  PROFESSIONAL_SERVICES: 'Professional Services',
  MISCELLANEOUS: 'Miscellaneous',
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      category: '',
      expenseDate: new Date(),
      amount: 0,
      currency: 'USD',
      paymentMethod: '',
      employeeName: '',
      description: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (currentCompany) {
      fetchData();
    }
  }, [currentCompany]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const expensesData = await expenseService.getExpenses();
      setExpenses(expensesData);

      // Calculate statistics
      const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      const pendingExpenses = expensesData
        .filter(expense => expense.status === 'PENDING')
        .reduce((sum, expense) => sum + expense.amount, 0);
      const approvedExpenses = expensesData
        .filter(expense => expense.status === 'APPROVED' || expense.status === 'PAID')
        .reduce((sum, expense) => sum + expense.amount, 0);
      const rejectedExpenses = expensesData
        .filter(expense => expense.status === 'REJECTED' || expense.status === 'CANCELLED')
        .reduce((sum, expense) => sum + expense.amount, 0);

      setStats({
        totalExpenses,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
      });
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast.error(error.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (values: ExpenseFormValues) => {
    try {
      setSubmitting(true);

      const expenseData: CreateExpenseRequest = {
        title: values.title,
        description: values.description,
        category: values.category as ExpenseCategory,
        amount: values.amount,
        currency: values.currency,
        expenseDate: format(values.expenseDate, 'yyyy-MM-dd'),
        paymentMethod: values.paymentMethod as any,
        paymentDate: values.paymentDate ? format(values.paymentDate, 'yyyy-MM-dd') : undefined,
        employeeName: values.employeeName,
        notes: values.notes,
      };

      await expenseService.createExpense(expenseData);
      toast.success('Expense created successfully');
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      console.error('Error creating expense:', error);
      toast.error(error.message || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveExpense = async (expense: ExpenseSummary) => {
    try {
      await expenseService.updateExpenseStatus(expense.expenseId, 'APPROVED');
      toast.success('Expense approved successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error approving expense:', error);
      toast.error(error.message || 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async (expense: ExpenseSummary) => {
    try {
      await expenseService.updateExpenseStatus(expense.expenseId, 'REJECTED');
      toast.success('Expense rejected successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error rejecting expense:', error);
      toast.error(error.message || 'Failed to reject expense');
    }
  };

  const handleMarkAsPaid = async (expense: ExpenseSummary) => {
    try {
      await expenseService.updateExpenseStatus(expense.expenseId, 'PAID');
      toast.success('Expense marked as paid successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error marking expense as paid:', error);
      toast.error(error.message || 'Failed to mark expense as paid');
    }
  };

  if (!currentCompany) {
    return (
      <PageContainer>
        <div className='text-center text-muted-foreground'>
          Please select a company to manage expenses.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
        <button
          onClick={() => navigate('/finance')}
          className='hover:text-foreground flex items-center gap-1'
        >
          <Home className='h-4 w-4' />
          Finance Overview
        </button>
        <span>/</span>
        <span className='text-foreground'>Expenses</span>
      </div>

      <PageHeader>
        <PageTitle>Expenses</PageTitle>
        <PrimaryButton size='sm' onClick={() => setIsDialogOpen(true)}>
          <Plus className='h-4 w-4 mr-2' />
          Create Expense
        </PrimaryButton>
      </PageHeader>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-primary mb-1'>
                ${stats.totalExpenses.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Total Expenses</p>
            </div>
            <DollarSign className='h-5 w-5 text-primary' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-warning mb-1'>
                ${stats.pendingExpenses.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Pending Expenses</p>
            </div>
            <DollarSign className='h-5 w-5 text-warning' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-success mb-1'>
                ${stats.approvedExpenses.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Approved Expenses</p>
            </div>
            <DollarSign className='h-5 w-5 text-success' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-error mb-1'>
                ${stats.rejectedExpenses.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Rejected Expenses</p>
            </div>
            <DollarSign className='h-5 w-5 text-error' />
          </div>
        </Card>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className='flex items-center justify-center min-h-[300px]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          message='No expenses found'
          action={
            <PrimaryButton size='sm' onClick={() => setIsDialogOpen(true)}>
              Create First Expense
            </PrimaryButton>
          }
        />
      ) : (
        <Card>
          <DataTable>
            <TableHeader>
              <TableRow>
                <TableHead>Expense ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Amount</TableHead>
                <TableHead className='w-[50px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.expenseId}</TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{expense.title}</div>
                      {expense.employeeName && (
                        <div className='text-xs text-muted-foreground'>
                          By: {expense.employeeName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{CATEGORY_LABELS[expense.category]}</TableCell>
                  <TableCell>
                    <StatusBadge variant={STATUS_COLORS[expense.status]}>
                      {expense.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                  <TableCell className='text-right font-medium'>
                    {expense.currency} {expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => toast.info(`View expense ${expense.expenseId}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                        {expense.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveExpense(expense)}>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectExpense(expense)}>
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {expense.status === 'APPROVED' && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(expense)}>
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        </Card>
      )}

      {/* Create Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create Expense</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateExpense)} className='space-y-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <TextInput {...field} placeholder='Enter expense title' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='expenseDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <TextInput
                          type='number'
                          step='0.01'
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          placeholder='0.00'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select currency' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='USD'>USD</SelectItem>
                          <SelectItem value='EUR'>EUR</SelectItem>
                          <SelectItem value='GBP'>GBP</SelectItem>
                          <SelectItem value='INR'>INR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='paymentMethod'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select payment method' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='CASH'>Cash</SelectItem>
                          <SelectItem value='CHEQUE'>Cheque</SelectItem>
                          <SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
                          <SelectItem value='UPI'>UPI</SelectItem>
                          <SelectItem value='CARD'>Card</SelectItem>
                          <SelectItem value='OTHER'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='paymentDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='employeeName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                      <TextInput {...field} placeholder='Enter employee name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TextArea {...field} rows={3} placeholder='Enter expense description' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <TextArea {...field} rows={2} placeholder='Enter additional notes' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <PrimaryButton type='submit' loading={submitting}>
                  Create
                </PrimaryButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default ExpensesPage;
