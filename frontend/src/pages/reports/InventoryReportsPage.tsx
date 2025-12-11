import React, { useState, useEffect } from 'react';
import { useHeader } from '../../contexts/HeaderContext';
import { Typography, Breadcrumb, Tabs, message } from 'antd';
import MainLayout from '../../components/layout/MainLayout';
import dayjs, { Dayjs } from 'dayjs';
import './shared/ReportStyles.scss';

// Import Shared Components
import ReportFilters from './shared/ReportFilters';
import ReportSummaryCards, { SummaryCardProps } from './shared/ReportSummaryCards';

// Import Services
import { reportService } from '../../services/reportService';

// Import Report Components
import StockSummaryReport from '../../components/reports/inventory/StockSummaryReport';
import StockMovementReport from '../../components/reports/inventory/StockMovementReport';
import LowStockReport from '../../components/reports/inventory/LowStockReport';
import StockValuationReport from '../../components/reports/inventory/StockValuationReport';
import StockAgingReport from '../../components/reports/inventory/StockAgingReport';

const { Title } = Typography;
const { TabPane } = Tabs;

const InventoryReportsPage: React.FC = () => {
  const { setHeaderActions } = useHeader();
  const [activeTab, setActiveTab] = useState('stock-summary');

  // Global Filter State
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Initialize dates on mount
  useEffect(() => {
    const now = dayjs();
    const firstDay = now.startOf('month');
    const lastDay = now.endOf('month');
    setDateRange([firstDay, lastDay]);
  }, []);

  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  // Fetch data when filters or active tab changes
  useEffect(() => {
    if (dateRange) {
      handleGenerateReport();
    }
  }, [activeTab, dateRange]);

  const handleGenerateReport = async () => {
    if (!dateRange) return;

    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      let data: any;

      switch (activeTab) {
        case 'stock-summary':
          // @ts-ignore
          if (reportService.getInventorySummary) {
            // @ts-ignore
            data = await reportService.getInventorySummary();
          }
          break;
        case 'stock-movement':
          // @ts-ignore
          if (reportService.getInventoryMovementReport) {
            // @ts-ignore
            data = await reportService.getInventoryMovementReport(startDate, endDate);
          }
          break;
        case 'low-stock':
          // @ts-ignore
          if (reportService.getLowStockReport) {
            // @ts-ignore
            data = await reportService.getLowStockReport();
          }
          break;
        case 'stock-valuation':
          // @ts-ignore
          if (reportService.getStockValuationReport) {
            // @ts-ignore
            data = await reportService.getStockValuationReport(undefined, endDate);
          }
          break;
        case 'stock-aging':
          // @ts-ignore
          if (reportService.getStockAgingReport) {
            // @ts-ignore
            data = await reportService.getStockAgingReport(endDate);
          }
          break;
        default:
          break;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // Transform Data to Summary Cards based on Active Tab
  const getSummaryCards = (): SummaryCardProps[] => {
    if (!reportData || !reportData.summary) return [];

    if (activeTab === 'stock-summary') {
      return [
        { title: 'Total Products', value: reportData.summary.totalProducts || 0 },
        {
          title: 'Total Stock Value',
          value: reportData.summary.totalStockValue?.toFixed(2) || '0.00',
          prefix: '₹',
        },
        {
          title: 'Low Stock Items',
          value: reportData.summary.lowStockItems || 0,
          color: '#ff4d4f',
        },
        { title: 'Out of Stock', value: reportData.summary.outOfStock || 0, color: '#ff4d4f' },
      ];
    }

    if (activeTab === 'stock-movement') {
      return [
        { title: 'Total Movements', value: reportData.summary.totalMovements || 0 },
        { title: 'Stock In', value: reportData.summary.stockIn || 0, color: '#52c41a' },
        { title: 'Stock Out', value: reportData.summary.stockOut || 0, color: '#ff4d4f' },
        { title: 'Net Change', value: reportData.summary.netChange || 0 },
      ];
    }

    if (activeTab === 'low-stock') {
      return [
        {
          title: 'Low Stock Items',
          value: reportData.summary.lowStockItems || 0,
          color: '#ff4d4f',
        },
        { title: 'Critical Items', value: reportData.summary.criticalItems || 0, color: '#ff4d4f' },
        {
          title: 'Reorder Value',
          value: reportData.summary.reorderValue?.toFixed(2) || '0.00',
          prefix: '₹',
        },
      ];
    }

    if (activeTab === 'stock-valuation') {
      return [
        {
          title: 'Total Valuation',
          value: reportData.summary.totalValuation?.toFixed(2) || '0.00',
          prefix: '₹',
        },
        {
          title: 'Cost Value',
          value: reportData.summary.costValue?.toFixed(2) || '0.00',
          prefix: '₹',
        },
        {
          title: 'Selling Value',
          value: reportData.summary.sellingValue?.toFixed(2) || '0.00',
          prefix: '₹',
        },
        {
          title: 'Potential Profit',
          value: reportData.summary.potentialProfit?.toFixed(2) || '0.00',
          prefix: '₹',
          color: '#52c41a',
        },
      ];
    }

    if (activeTab === 'stock-aging') {
      return [
        { title: 'Total Items', value: reportData.summary.totalItems || 0 },
        { title: 'Fast Moving', value: reportData.summary.fastMoving || 0, color: '#52c41a' },
        { title: 'Slow Moving', value: reportData.summary.slowMoving || 0, color: '#faad14' },
        { title: 'Dead Stock', value: reportData.summary.deadStock || 0, color: '#ff4d4f' },
      ];
    }

    return [];
  };

  return (
    <MainLayout>
      <div className='page-container'>
        <div className='page-header-section'>
          <Breadcrumb
            items={[
              { title: 'Home', href: '/' },
              { title: 'Reports', href: '/reports' },
              { title: 'Inventory Reports' },
            ]}
            className='breadcrumb-navigation'
          />
          <Title level={2}>Inventory Reports</Title>
        </div>

        {/* Global Filters & Summary */}
        <ReportFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          searchText={searchText}
          setSearchText={setSearchText}
          onGenerate={handleGenerateReport}
          loading={loading}
        />

        <ReportSummaryCards cards={getSummaryCards()} loading={loading} />

        <div className='reports-tabs-container'>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type='card'
            className='reports-tabs'
            destroyInactiveTabPane={true} // Clean up DOM when switching
          >
            <TabPane tab='Stock Summary' key='stock-summary'>
              <StockSummaryReport data={reportData} loading={loading} searchText={searchText} />
            </TabPane>

            <TabPane tab='Stock Movement' key='stock-movement'>
              <StockMovementReport />
            </TabPane>

            <TabPane tab='Low Stock Alerts' key='low-stock'>
              <LowStockReport />
            </TabPane>

            <TabPane tab='Stock Valuation' key='stock-valuation'>
              <StockValuationReport />
            </TabPane>

            <TabPane tab='Stock Aging' key='stock-aging'>
              <StockAgingReport />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default InventoryReportsPage;
