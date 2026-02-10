import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Plus,
  Users,
  Loader2,
  FileText,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

import { useHeader } from '@/contexts/HeaderContext';
import useAuth from '@/contexts/AuthContext';

import { PrimaryButton } from '@/components/globalComponents';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyticsService, DashboardAnalytics } from '@/services/analyticsService';
import { invoiceService, InvoiceSummary } from '@/services/invoiceService';
import { billService, BillSummary } from '@/services/billService';
import { COMPANY_TEXT } from '@/constants/company';
import UserInviteSheet from '@/components/users/UserInviteSheet';
import { StatusBadge } from '@/components/globalComponents';

const DashboardPage = () => {
  const { currentCompany } = useAuth();
  const { setHeaderActions } = useHeader();
  const navigate = useNavigate();
  const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceSummary[]>([]);
  const [recentBills, setRecentBills] = useState<BillSummary[]>([]);
  const userRole = currentCompany?.role;

  useEffect(() => {
    if (userRole && ['OWNER', 'ADMIN'].includes(userRole)) {
      setHeaderActions(
        <PrimaryButton size='sm' onClick={() => setInviteDrawerVisible(true)}>
          Invite Team Member
        </PrimaryButton>
      );
    } else {
      setHeaderActions(null);
    }

    return () => setHeaderActions(null);
  }, [setHeaderActions, userRole]);

  const fetchDashboardData = async () => {
    if (!currentCompany?.id) return;

    setLoading(true);
    try {
      const [dashboardAnalytics, revenueTrendData, invoicesData, billsData] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        analyticsService.getRevenueTrends(6),
        invoiceService.getInvoices().catch(() => []),
        billService.getBills().catch(() => []),
      ]);

      // Get last 3 invoices sorted by date
      const sortedInvoices = invoicesData
        .sort(
          (a: InvoiceSummary, b: InvoiceSummary) =>
            new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
        )
        .slice(0, 3);
      setRecentInvoices(sortedInvoices);

      // Get last 3 bills sorted by date
      const sortedBills = billsData
        .sort(
          (a: BillSummary, b: BillSummary) =>
            new Date(b.billDate).getTime() - new Date(a.billDate).getTime()
        )
        .slice(0, 3);
      setRecentBills(sortedBills);

      setAnalytics(dashboardAnalytics);

      // Transform revenue trends for Recharts
      const chartData = revenueTrendData.map((item: any) => ({
        month: item.month,
        Revenue: item.revenue,
        Orders: item.orders || 0,
      }));
      setRevenueTrends(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentCompany?.id]);

  const allQuickActions = [
    {
      title: COMPANY_TEXT.ADD_PRODUCT,
      icon: <Plus className='h-8 w-8' />,
      description: COMPANY_TEXT.ADD_PRODUCT_DESC,
      action: () => navigate('/products'),
    },
    {
      title: COMPANY_TEXT.NEW_ORDER,
      icon: <ShoppingCart className='h-8 w-8' />,
      description: COMPANY_TEXT.NEW_ORDER_DESC,
      action: () => navigate('/orders'),
    },
    {
      title: COMPANY_TEXT.INVITE_TEAM,
      icon: <Users className='h-8 w-8' />,
      description: COMPANY_TEXT.INVITE_TEAM_DESC,
      action: () => setInviteDrawerVisible(true),
      requiresRole: ['OWNER', 'ADMIN'],
    },
    {
      title: COMPANY_TEXT.VIEW_REPORTS,
      icon: <BarChart3 className='h-8 w-8' />,
      description: COMPANY_TEXT.VIEW_REPORTS_DESC,
      action: () => navigate('/reports'),
    },
  ];

  const quickActions = allQuickActions.filter(
    action => !action.requiresRole || (userRole && action.requiresRole.includes(userRole))
  );

  const totalRevenue = analytics?.monthlyRevenue || 0;
  const totalInventoryValue = analytics?.totalInventoryValue || 0;
  const pendingPayments = analytics?.pendingPayments || 0;

  const getInvoiceStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success' as const;
      case 'OVERDUE':
        return 'error' as const;
      case 'PARTIALLY_PAID':
        return 'warning' as const;
      default:
        return 'default' as const;
    }
  };

  const getBillStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success' as const;
      case 'OVERDUE':
        return 'error' as const;
      case 'PARTIALLY_PAID':
        return 'warning' as const;
      case 'RECEIVED':
        return 'info' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className='mb-6'>
        <h2 className='font-heading text-heading-3 font-semibold m-0'>Dashboard</h2>
      </div>

      {/* Dashboard Content */}
      <div className='relative'>
        {loading && (
          <div className='absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        )}

        {/* Key Performance Indicators */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {/* Total Revenue Card */}
          <Card className='hover:shadow-lg hover:-translate-y-0.5 transition-all'>
            <div className='p-6'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex-1'>
                  <p className='text-sm text-muted-foreground font-medium mb-1'>Total Revenue</p>
                  <div className='flex items-center gap-2'>
                    <IndianRupee className='h-5 w-5 text-primary' />
                    <p className='text-2xl font-semibold text-primary'>
                      {totalRevenue.toLocaleString()}
                    </p>
                    <TrendingUp className='h-4 w-4 text-success' />
                  </div>
                </div>
              </div>
              <p className='text-xs text-muted-foreground font-medium'>This month</p>
            </div>
          </Card>

          {/* Inventory Value Card */}
          <Card className='hover:shadow-lg hover:-translate-y-0.5 transition-all'>
            <div className='p-6'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex-1'>
                  <p className='text-sm text-muted-foreground font-medium mb-1'>Inventory Value</p>
                  <div className='flex items-center gap-2'>
                    <IndianRupee className='h-5 w-5 text-success' />
                    <p className='text-2xl font-semibold text-success'>
                      {totalInventoryValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <p className='text-xs text-muted-foreground font-medium'>
                Low Stock: {analytics?.lowStockProducts || 0}
              </p>
            </div>
          </Card>

          {/* Active Orders Card */}
          <Card className='hover:shadow-lg hover:-translate-y-0.5 transition-all'>
            <div className='p-6'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex-1'>
                  <p className='text-sm text-muted-foreground font-medium mb-1'>Active Orders</p>
                  <div className='flex items-center gap-2'>
                    <ShoppingCart className='h-5 w-5 text-info' />
                    <p className='text-2xl font-semibold text-info'>
                      {analytics?.activeOrders || 0}
                    </p>
                  </div>
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>
                Total Products: {analytics?.totalProducts || 0}
              </p>
            </div>
          </Card>

          {/* Pending Payments Card */}
          <Card className='hover:shadow-lg hover:-translate-y-0.5 transition-all'>
            <div className='p-6'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex-1'>
                  <p className='text-sm text-muted-foreground font-medium mb-1'>Pending Payments</p>
                  <div className='flex items-center gap-2'>
                    <IndianRupee className='h-5 w-5 text-warning' />
                    <p className='text-2xl font-semibold text-warning'>
                      {pendingPayments.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>
                Overdue: {analytics?.overdueInvoices || 0}
              </p>
            </div>
          </Card>
        </div>

        {/* Revenue Trend Chart - Smooth Curved Line Chart */}
        {revenueTrends.length > 0 && (
          <Card className='mb-6 overflow-hidden'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-lg font-semibold'>Revenue Overview</h3>
                  <p className='text-sm text-muted-foreground'>Monthly revenue and order trends</p>
                </div>
              </div>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={revenueTrends}>
                  <defs>
                    <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#7c3aed' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#7c3aed' stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id='ordersGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
                  <XAxis
                    dataKey='month'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={8}
                  />
                  <YAxis
                    tickFormatter={value => `₹${(value / 1000).toFixed(0)}K`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dx={-4}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `₹${value.toLocaleString('en-IN')}`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                      padding: '12px 16px',
                    }}
                    labelStyle={{ color: '#475569', fontWeight: 600, marginBottom: 4 }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Legend
                    verticalAlign='top'
                    align='right'
                    iconType='circle'
                    iconSize={10}
                    wrapperStyle={{ paddingBottom: 16, fontSize: 13 }}
                  />
                  <Area
                    type='monotone'
                    dataKey='Revenue'
                    stroke='#7c3aed'
                    strokeWidth={2.5}
                    fill='url(#revenueGradient)'
                    dot={{ r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 3 }}
                  />
                  <Area
                    type='monotone'
                    dataKey='Orders'
                    stroke='#10b981'
                    strokeWidth={2.5}
                    fill='url(#ordersGradient)'
                    dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className='cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all'
                onClick={action.action}
              >
                <div className='p-6 text-center'>
                  <div className='flex justify-center mb-3 text-primary'>{action.icon}</div>
                  <h4 className='text-base font-medium mb-1'>{action.title}</h4>
                  <p className='text-sm text-muted-foreground'>{action.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Transactions - Tabbed Invoices & Bills */}
        <Card>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-semibold'>Recent Transactions</h3>
              </div>
            </div>
            <Tabs defaultValue='invoices' className='w-full'>
              <TabsList className='mb-4'>
                <TabsTrigger value='invoices'>Invoices</TabsTrigger>
                <TabsTrigger value='bills'>Bills</TabsTrigger>
              </TabsList>

              {/* Invoices Tab */}
              <TabsContent value='invoices'>
                {recentInvoices.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-6'>
                    No recent invoices found
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {recentInvoices.map(invoice => (
                      <div
                        key={invoice.invoiceId}
                        className='flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer'
                        onClick={() => navigate(`/invoices/${invoice.invoiceId}`)}
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                            <FileText className='h-5 w-5 text-primary' />
                          </div>
                          <div>
                            <p className='font-medium text-sm'>{invoice.invoiceId}</p>
                            <p className='text-xs text-muted-foreground'>{invoice.customerName}</p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-sm'>
                            ₹{Number(invoice.totalAmount).toLocaleString()}
                          </p>
                          <StatusBadge variant={getInvoiceStatusVariant(invoice.status)}>
                            {invoice.status.replace('_', ' ')}
                          </StatusBadge>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/invoices')}
                      className='w-full text-sm text-primary hover:underline flex items-center justify-center gap-1 pt-2'
                    >
                      View All Invoices <ArrowRight className='h-4 w-4' />
                    </button>
                  </div>
                )}
              </TabsContent>

              {/* Bills Tab */}
              <TabsContent value='bills'>
                {recentBills.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-6'>
                    No recent bills found
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {recentBills.map(bill => (
                      <div
                        key={bill.billId}
                        className='flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer'
                        onClick={() => navigate(`/bills/${bill.billId}`)}
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center'>
                            <Receipt className='h-5 w-5 text-orange-500' />
                          </div>
                          <div>
                            <p className='font-medium text-sm'>{bill.billNumber || bill.billId}</p>
                            <p className='text-xs text-muted-foreground'>{bill.supplierName}</p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-sm'>
                            ₹{Number(bill.totalAmount).toLocaleString()}
                          </p>
                          <StatusBadge variant={getBillStatusVariant(bill.status)}>
                            {bill.status.replace('_', ' ')}
                          </StatusBadge>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/bills')}
                      className='w-full text-sm text-primary hover:underline flex items-center justify-center gap-1 pt-2'
                    >
                      View All Bills <ArrowRight className='h-4 w-4' />
                    </button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>

      {/* User Invite Sheet */}
      <UserInviteSheet
        open={inviteDrawerVisible}
        onOpenChange={setInviteDrawerVisible}
        onSuccess={() => {
          setInviteDrawerVisible(false);
          toast.success('User invited successfully');
        }}
      />
    </div>
  );
};

export default DashboardPage;
