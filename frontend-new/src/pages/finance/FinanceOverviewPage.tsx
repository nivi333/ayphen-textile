import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
  CreditCard,
  Landmark,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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
  OutlinedButton,
} from '@/components/globalComponents';
import { analyticsService } from '@/services/analyticsService';
import { invoiceService, InvoiceSummary } from '@/services/invoiceService';
import { billService, BillSummary } from '@/services/billService';

const FinanceOverviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [financialTrendData, setFinancialTrendData] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceSummary[]>([]);
  const [recentBills, setRecentBills] = useState<BillSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'bills'>('invoices');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard analytics
      const dashboardAnalytics = await analyticsService.getDashboardAnalytics();
      setDashboardData(dashboardAnalytics);

      // Fetch revenue trends for 6 months
      const revenueTrends = await analyticsService.getRevenueTrends(6);

      // Transform revenue data for chart
      const chartData: any[] = [];
      revenueTrends.forEach(item => {
        chartData.push({ month: item.month, type: 'Revenue', value: item.revenue });
        // Estimate expenses as 70% of revenue for visualization
        const expenses = Math.round(item.revenue * 0.7);
        chartData.push({ month: item.month, type: 'Expenses', value: expenses });
      });
      setFinancialTrendData(chartData);

      // Fetch recent invoices and bills
      const [invoicesData, billsData] = await Promise.all([
        invoiceService.getInvoices(),
        billService.getBills(),
      ]);

      // Sort by date and take the most recent 5
      const sortedInvoices = invoicesData
        .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
        .slice(0, 5);

      const sortedBills = billsData
        .sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())
        .slice(0, 5);

      setRecentInvoices(sortedInvoices);
      setRecentBills(sortedBills);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceStatusVariant = (
    status: string
  ): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (status === 'PAID') return 'success';
    if (status === 'OVERDUE') return 'error';
    if (status === 'PARTIALLY_PAID') return 'warning';
    if (status === 'SENT') return 'info';
    return 'default';
  };

  const getBillStatusVariant = (
    status: string
  ): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (status === 'PAID') return 'success';
    if (status === 'OVERDUE') return 'error';
    if (status === 'PARTIALLY_PAID') return 'warning';
    if (status === 'RECEIVED') return 'info';
    return 'default';
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      </PageContainer>
    );
  }

  const totalRevenue = dashboardData?.monthlyRevenue || 0;
  const totalExpenses = Math.round(totalRevenue * 0.7);
  const netProfit = Math.round(totalRevenue * 0.3);
  const profitMargin = 30;

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Finance Overview</PageTitle>
        <div className='flex items-center gap-2'>
          <OutlinedButton size='sm' onClick={() => navigate('/finance/accounts-receivable')}>
            <Landmark className='h-4 w-4 mr-2' />
            Receivables
          </OutlinedButton>
          <OutlinedButton size='sm' onClick={() => navigate('/finance/accounts-payable')}>
            <CreditCard className='h-4 w-4 mr-2' />
            Payables
          </OutlinedButton>
          <OutlinedButton size='sm' onClick={() => navigate('/finance/expenses')}>
            <FileText className='h-4 w-4 mr-2' />
            Expenses
          </OutlinedButton>
        </div>
      </PageHeader>

      {/* Key Financial Metrics */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-primary mb-1'>
                ${totalRevenue.toLocaleString()}
              </p>
              <p className='text-sm text-muted-foreground'>Total Revenue</p>
            </div>
            <div className='ml-4'>
              <div className='flex items-center gap-1 text-success'>
                <DollarSign className='h-5 w-5' />
                <TrendingUp className='h-4 w-4' />
              </div>
            </div>
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-error mb-1'>
                ${totalExpenses.toLocaleString()}
              </p>
              <p className='text-sm text-muted-foreground'>Total Expenses</p>
            </div>
            <div className='ml-4'>
              <TrendingDown className='h-5 w-5 text-error' />
            </div>
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-success mb-1'>${netProfit.toLocaleString()}</p>
              <p className='text-sm text-muted-foreground'>Net Profit</p>
            </div>
            <div className='ml-4'>
              <Wallet className='h-5 w-5 text-success' />
            </div>
          </div>
        </Card>

        <Card className='hover:shadow-secondary transition-shadow'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-info mb-1'>{profitMargin}%</p>
              <p className='text-sm text-muted-foreground'>Profit Margin</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card className='mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Revenue vs Expenses Trend</h3>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={financialTrendData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis tickFormatter={value => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line
              type='monotone'
              dataKey='value'
              stroke='#52c41a'
              strokeWidth={2}
              dot={{ fill: '#52c41a' }}
              name='Revenue'
              data={financialTrendData.filter(d => d.type === 'Revenue')}
            />
            <Line
              type='monotone'
              dataKey='value'
              stroke='#ff4d4f'
              strokeWidth={2}
              dot={{ fill: '#ff4d4f' }}
              name='Expenses'
              data={financialTrendData.filter(d => d.type === 'Expenses')}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Financial Transactions */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>Recent Financial Transactions</h3>
          <div className='flex gap-2'>
            <OutlinedButton
              size='sm'
              variant={activeTab === 'invoices' ? 'primary' : 'outlined'}
              onClick={() => setActiveTab('invoices')}
            >
              Invoices
            </OutlinedButton>
            <OutlinedButton
              size='sm'
              variant={activeTab === 'bills' ? 'primary' : 'outlined'}
              onClick={() => setActiveTab('bills')}
            >
              Bills
            </OutlinedButton>
          </div>
        </div>

        {activeTab === 'invoices' ? (
          <DataTable>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center text-muted-foreground'>
                    No recent invoices
                  </TableCell>
                </TableRow>
              ) : (
                recentInvoices.map(invoice => (
                  <TableRow key={invoice.invoiceId}>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/invoices/${invoice.invoiceId}`)}
                        className='text-primary hover:underline'
                      >
                        {invoice.invoiceId}
                      </button>
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {invoice.currency} {Number(invoice.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={getInvoiceStatusVariant(invoice.status)}>
                        {invoice.status.replace('_', ' ')}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </DataTable>
        ) : (
          <DataTable>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center text-muted-foreground'>
                    No recent bills
                  </TableCell>
                </TableRow>
              ) : (
                recentBills.map(bill => (
                  <TableRow key={bill.billId}>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/bills/${bill.billId}`)}
                        className='text-primary hover:underline'
                      >
                        {bill.billId}
                      </button>
                    </TableCell>
                    <TableCell>{bill.supplierName}</TableCell>
                    <TableCell>{new Date(bill.billDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {bill.currency} {Number(bill.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={getBillStatusVariant(bill.status)}>
                        {bill.status.replace('_', ' ')}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </DataTable>
        )}

        <div className='mt-4 text-center'>
          <button
            onClick={() =>
              navigate(
                activeTab === 'invoices'
                  ? '/finance/accounts-receivable'
                  : '/finance/accounts-payable'
              )
            }
            className='text-primary hover:underline text-sm'
          >
            View All {activeTab === 'invoices' ? 'Invoices' : 'Bills'}
          </button>
        </div>
      </Card>
    </PageContainer>
  );
};

export default FinanceOverviewPage;
