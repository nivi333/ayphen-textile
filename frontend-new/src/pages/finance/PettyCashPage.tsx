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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  pettyCashService,
  PettyCashAccount,
  PettyCashTransaction,
  PettyCashTransactionType,
  CreateAccountRequest,
  CreateTransactionRequest,
} from '@/services/pettyCashService';
import useAuth from '@/contexts/AuthContext';

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  description: z.string().optional(),
  initialBalance: z.number().min(0, 'Initial balance must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  maxLimit: z.number().optional(),
  minBalance: z.number().optional(),
  custodianName: z.string().optional(),
});

const transactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  transactionType: z.string().min(1, 'Transaction type is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  transactionDate: z.date(),
  category: z.string().optional(),
  recipientName: z.string().optional(),
  receiptNumber: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;
type TransactionFormValues = z.infer<typeof transactionSchema>;

const TRANSACTION_TYPE_COLORS: Record<PettyCashTransactionType, 'success' | 'error' | 'info'> = {
  REPLENISHMENT: 'success',
  DISBURSEMENT: 'error',
  ADJUSTMENT: 'info',
};

const DISBURSEMENT_CATEGORIES = [
  'Office Supplies',
  'Travel',
  'Meals',
  'Transportation',
  'Postage',
  'Utilities',
  'Repairs',
  'Miscellaneous',
];

const PettyCashPage = () => {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const [accounts, setAccounts] = useState<PettyCashAccount[]>([]);
  const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('accounts');
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalBalance: 0,
    activeAccounts: 0,
  });

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      description: '',
      initialBalance: 0,
      currency: 'USD',
      custodianName: '',
    },
  });

  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: '',
      transactionType: '',
      amount: 0,
      transactionDate: new Date(),
      category: '',
      recipientName: '',
      receiptNumber: '',
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
      const [accountsData, transactionsData] = await Promise.all([
        pettyCashService.getAccounts(),
        pettyCashService.getTransactions(),
      ]);

      setAccounts(accountsData);
      setTransactions(transactionsData);

      // Calculate statistics
      const totalBalance = accountsData.reduce((sum, acc) => sum + acc.currentBalance, 0);
      const activeAccounts = accountsData.filter(acc => acc.isActive).length;

      setStats({ totalBalance, activeAccounts });
    } catch (error: any) {
      console.error('Error fetching petty cash data:', error);
      toast.error(error.message || 'Failed to fetch petty cash data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (values: AccountFormValues) => {
    try {
      setSubmitting(true);

      const accountData: CreateAccountRequest = {
        name: values.name,
        description: values.description,
        initialBalance: values.initialBalance,
        currency: values.currency,
        maxLimit: values.maxLimit,
        minBalance: values.minBalance,
        custodianName: values.custodianName,
      };

      await pettyCashService.createAccount(accountData);
      toast.success('Petty cash account created successfully');
      setIsAccountDialogOpen(false);
      accountForm.reset();
      fetchData();
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTransaction = async (values: TransactionFormValues) => {
    try {
      setSubmitting(true);

      const transactionData: CreateTransactionRequest = {
        accountId: values.accountId,
        transactionType: values.transactionType as PettyCashTransactionType,
        amount: values.amount,
        transactionDate: format(values.transactionDate, 'yyyy-MM-dd'),
        category: values.category,
        recipientName: values.recipientName,
        receiptNumber: values.receiptNumber,
        description: values.description,
        notes: values.notes,
      };

      await pettyCashService.createTransaction(transactionData);
      toast.success('Transaction created successfully');
      setIsTransactionDialogOpen(false);
      transactionForm.reset();
      fetchData();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(error.message || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentCompany) {
    return (
      <PageContainer>
        <div className='text-center text-muted-foreground'>
          Please select a company to manage petty cash.
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
        <span className='text-foreground'>Petty Cash</span>
      </div>

      <PageHeader>
        <PageTitle>Petty Cash Management</PageTitle>
        <PrimaryButton
          size='sm'
          onClick={() =>
            activeTab === 'accounts'
              ? setIsAccountDialogOpen(true)
              : setIsTransactionDialogOpen(true)
          }
        >
          <Plus className='h-4 w-4 mr-2' />
          {activeTab === 'accounts' ? 'Create Account' : 'Create Transaction'}
        </PrimaryButton>
      </PageHeader>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-success mb-1'>
                ${stats.totalBalance.toFixed(2)}
              </p>
              <p className='text-sm text-muted-foreground'>Total Petty Cash Balance</p>
            </div>
            <DollarSign className='h-5 w-5 text-success' />
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-info mb-1'>{stats.activeAccounts}</p>
              <p className='text-sm text-muted-foreground'>Active Accounts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='accounts'>Accounts</TabsTrigger>
          <TabsTrigger value='transactions'>Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value='accounts' className='mt-4'>
          {loading ? (
            <div className='flex items-center justify-center min-h-[300px]'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              message='No petty cash accounts found'
              action={
                <PrimaryButton size='sm' onClick={() => setIsAccountDialogOpen(true)}>
                  Create First Account
                </PrimaryButton>
              }
            />
          ) : (
            <Card>
              <DataTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className='text-right'>Current Balance</TableHead>
                    <TableHead>Custodian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='w-[50px]'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map(account => (
                    <TableRow key={account.id}>
                      <TableCell>{account.accountId}</TableCell>
                      <TableCell>
                        <div>
                          <div className='font-medium'>{account.name}</div>
                          {account.description && (
                            <div className='text-xs text-muted-foreground'>
                              {account.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{account.location?.name || '-'}</TableCell>
                      <TableCell className='text-right'>
                        <span
                          className={cn(
                            'font-medium',
                            account.currentBalance > 0 ? 'text-success' : 'text-error'
                          )}
                        >
                          {account.currency} {account.currentBalance.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{account.custodianName || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge variant={account.isActive ? 'success' : 'default'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
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
                              onClick={() => toast.info(`View transactions for ${account.name}`)}
                            >
                              View Transactions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toast.info(`Replenish ${account.name}`)}
                            >
                              Replenish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toast.info(`Adjust balance for ${account.name}`)}
                            >
                              Adjust Balance
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info(
                                  `${account.isActive ? 'Deactivate' : 'Activate'} ${account.name}`
                                )
                              }
                            >
                              {account.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </DataTable>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='transactions' className='mt-4'>
          {loading ? (
            <div className='flex items-center justify-center min-h-[300px]'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              message='No transactions found'
              action={
                <PrimaryButton size='sm' onClick={() => setIsTransactionDialogOpen(true)}>
                  Create First Transaction
                </PrimaryButton>
              }
            />
          ) : (
            <Card>
              <DataTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead className='text-right'>Balance After</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Recorded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.transactionId}</TableCell>
                      <TableCell>{transaction.account?.name || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge variant={TRANSACTION_TYPE_COLORS[transaction.transactionType]}>
                          {transaction.transactionType}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        <span
                          className={
                            transaction.transactionType === 'REPLENISHMENT'
                              ? 'text-success'
                              : transaction.transactionType === 'DISBURSEMENT'
                                ? 'text-error'
                                : ''
                          }
                        >
                          {transaction.transactionType === 'REPLENISHMENT' ? '+' : '-'}$
                          {transaction.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        ${transaction.balanceAfter.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          {transaction.description || '-'}
                          {transaction.recipientName && (
                            <div className='text-xs text-muted-foreground'>
                              To: {transaction.recipientName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.recordedBy || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </DataTable>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Account Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create Petty Cash Account</DialogTitle>
          </DialogHeader>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(handleCreateAccount)} className='space-y-4'>
              <FormField
                control={accountForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name *</FormLabel>
                    <FormControl>
                      <TextInput {...field} placeholder='Enter account name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accountForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TextArea {...field} rows={2} placeholder='Enter description' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={accountForm.control}
                  name='initialBalance'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Balance *</FormLabel>
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
                  control={accountForm.control}
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
                  control={accountForm.control}
                  name='maxLimit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Limit</FormLabel>
                      <FormControl>
                        <TextInput
                          type='number'
                          step='0.01'
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          placeholder='0.00'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accountForm.control}
                  name='minBalance'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Balance</FormLabel>
                      <FormControl>
                        <TextInput
                          type='number'
                          step='0.01'
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          placeholder='0.00'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={accountForm.control}
                name='custodianName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custodian Name</FormLabel>
                    <FormControl>
                      <TextInput {...field} placeholder='Enter custodian name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsAccountDialogOpen(false)}
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

      {/* Create Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
          </DialogHeader>
          <Form {...transactionForm}>
            <form
              onSubmit={transactionForm.handleSubmit(handleCreateTransaction)}
              className='space-y-4'
            >
              <FormField
                control={transactionForm.control}
                name='accountId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select account' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} (${account.currentBalance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={transactionForm.control}
                  name='transactionType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='REPLENISHMENT'>Replenishment</SelectItem>
                          <SelectItem value='DISBURSEMENT'>Disbursement</SelectItem>
                          <SelectItem value='ADJUSTMENT'>Adjustment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={transactionForm.control}
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
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={transactionForm.control}
                  name='transactionDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Date *</FormLabel>
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

                <FormField
                  control={transactionForm.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DISBURSEMENT_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={transactionForm.control}
                  name='recipientName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name</FormLabel>
                      <FormControl>
                        <TextInput {...field} placeholder='Enter recipient name' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={transactionForm.control}
                  name='receiptNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt Number</FormLabel>
                      <FormControl>
                        <TextInput {...field} placeholder='Enter receipt number' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={transactionForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TextArea {...field} rows={2} placeholder='Enter description' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={transactionForm.control}
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
                  onClick={() => setIsTransactionDialogOpen(false)}
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

export default PettyCashPage;
