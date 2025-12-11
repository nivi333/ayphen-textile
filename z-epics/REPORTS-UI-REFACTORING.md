# Reports UI Refactoring - Implementation Plan

## Overview
This document outlines the refactoring of the Reports UI to use a **Tabbed Interface** for better usability and to consolidate similar reports. The goal is to reduce navigation friction, minimize the number of categories, and provide a seamless "one-click" experience for viewing related reports.

## Key Changes
1.  **Consolidated Categories**: Reduce the number of report categories to the absolute essentials:
    *   **Financial Reports**
    *   **Inventory Reports**
    *   **Sales Reports**
    *   **Operations Reports** (Merges Production & Operational & Quality)
2.  **Tabbed Interface**: Instead of multiple separate pages, each Category Page will contain a set of **Tabs**.
    *   Example: `FinancialReportsPage` will have tabs: [Profit & Loss] [Balance Sheet] [Cash Flow] ...
    *   This removes the need for "Card Navigation" -> "Detail Page".
    *   Users land directly on the report tables.
3.  **Dashboard Integration**: High-level summaries (Analytics) will be moved to the Dashboard widgets instead of a separate "Analytics" page, unless specific detailed analysis is needed.

## New Structure & Mappings

### 1. Financial Reports (`/reports/financial`)
*   **Tabs**:
    1.  **Profit & Loss**
    2.  **Balance Sheet**
    3.  **Cash Flow**
    4.  **GST Report**
    5.  **Expense Summary**
    *   *(Trial Balance, AP, AR moved to "More" or consolidation if needed, otherwise keep as tabs)*

### 2. Inventory Reports (`/reports/inventory`)
*   **Tabs**:
    1.  **Stock Summary** (Current Stock)
    2.  **Stock Movement** (In/Out/Transfer)
    3.  **Low Stock** (Alerts)
    4.  **Stock Valuation** (Value of stock)
    5.  **Stock Aging**

### 3. Sales Reports (`/reports/sales`)
*   **Tabs**:
    1.  **Sales Summary**
    2.  **Sales Trend**
    3.  **Top Products**
    4.  **Sales by Region**
    5.  **Customer History**

### 4. Operations Reports (`/reports/operations`)
*   *Merges Production, Operational, and Quality*
*   **Tabs**:
    1.  **Production Planning**
    2.  **Machine Utilization**
    3.  **Efficiency**
    4.  **Inspection Summary** (Quality)
    5.  **Downtime Analysis**

## Implementation Tasks

### 1. Refactor Category Pages ✅ COMPLETED
*   [x] **FinancialReportsPage.tsx**: Converted to Tabbed View with filters and summary cards above tabs.
*   [x] **InventoryReportsPage.tsx**: Converted to Tabbed View with filters and summary cards above tabs.
*   [x] **SalesReportsPage.tsx**: Already implemented with proper tabbed interface.
*   [x] **OperationalReportsPage.tsx**: Converted to Tabbed View with filters and summary cards above tabs.

### 2. Refactor Report Pages into Components ✅ COMPLETED
*   [x] All report components extracted and organized under `/components/reports/`
*   [x] Financial reports: ProfitLossReport, BalanceSheetReport, CashFlowReport, etc.
*   [x] Inventory reports: StockSummaryReport, StockMovementReport, LowStockReport, etc.
*   [x] Sales reports: SalesSummaryReport, SalesTrendReport, TopSellingProductsReport, etc.
*   [x] Operational reports: ProductionEfficiencyReport, MachineUtilizationReport, etc.

### 3. Route Updates ✅ COMPLETED
*   [x] Updated `frontend/src/router/AppRouter.tsx` with consolidated report routes.
*   [x] Removed individual routes for report sub-pages.
*   [x] Main routes: `/reports/financial`, `/reports/inventory`, `/reports/sales`, `/reports/operational`

### 4. Sidebar Updates ✅ COMPLETED
*   [x] Updated `navigationConfig.ts` to show only the 4 main categories.
*   [x] Consolidated navigation structure for better UX.

## UI Improvements Implemented

### Consistent Layout Pattern (Following Sales Reports)
1. **Search Bar & Filters Row**: Positioned above tabs
   - Date range picker
   - Search input
   - Generate Report button
   - Save Configuration & PDF export buttons

2. **Summary Cards Row**: Positioned between filters and tabs
   - Dynamic summary metrics based on active tab
   - Color-coded values (green for positive, red for negative)
   - Responsive grid layout (4 cards per row on desktop)

3. **Tabbed Interface**: Clean tab navigation
   - Card-style tabs
   - Destroys inactive tab panes for performance
   - Each tab contains its specific report component

### Report Components Structure
- **Shared Components**: `ReportFilters.tsx`, `ReportSummaryCards.tsx`
- **Shared Styles**: `ReportStyles.scss` for consistent styling
- **Data Flow**: Parent page fetches data → Passes to child components
- **Loading States**: Proper loading indicators and empty states

## Timeline ✅ COMPLETED
*   **Phase 1**: Extract Report Logic into Reusable Components. ✅
*   **Phase 2**: Create Tabbed Container Pages. ✅
*   **Phase 3**: Clean up Router and Sidebar. ✅
*   **Phase 4**: Implement consistent UI pattern across all report pages. ✅

## Changes Summary

### Files Modified:
1. `/frontend/src/pages/reports/FinancialReportsPage.tsx` - Added filters and summary cards above tabs
2. `/frontend/src/pages/reports/InventoryReportsPage.tsx` - Added filters and summary cards above tabs
3. `/frontend/src/pages/reports/OperationalReportsPage.tsx` - Added filters and summary cards above tabs
4. `/frontend/src/pages/reports/SalesReportsPage.tsx` - Already implemented (reference pattern)
5. `/frontend/src/components/reports/inventory/StockSummaryReport.tsx` - Updated to accept props

### Dec 11, 2025 – Completion Notes (API wiring + parity)
- Ensured all report pages strictly follow the Sales layout pattern (Filters → Summary Cards → Tabs with `destroyInactiveTabPane`).
- FinancialReportsPage: corrected service calls to existing methods
  - `getBalanceSheet()` (was getBalanceSheetReport)
  - `getCashFlowStatement()` (was getCashFlowReport)
  - `getTrialBalance()` (was getTrialBalanceReport)
  - `getExpenseSummary()` (was getExpenseSummaryReport)
  - Unified Tabs to `destroyInactiveTabPane={true}` to match Sales.
- SalesReportsPage: Sales Trend tab now uses `reportService.getSalesTrendsReport(start, end, groupBy)`.
- InventoryReportsPage: fixed method names/params to match implemented APIs
  - `getInventorySummary()` (no date range)
  - `getInventoryMovementReport(start, end)`
  - `getLowStockReport(locationId?)`
  - `getStockValuationReport(locationId?, asOfDate?)` using endDate as asOfDate
  - `getStockAgingReport(asOfDate)` using endDate as asOfDate
- OperationalReportsPage already aligned with the pattern; no API changes required.

Outcome: All Reports screens (Financial, Inventory, Operational) now match the Sales Reports layout and are wired to live endpoints.

### Key Features:
- ✅ Consolidated 4 main report categories
- ✅ Tabbed interface for related reports
- ✅ Consistent UI pattern across all report pages
- ✅ Filters and summary cards positioned above tabs
- ✅ Live data integration (no dummy data)
- ✅ Responsive design
- ✅ Loading states and error handling
- ✅ Export functionality (PDF, Excel, CSV)

### Removed/Consolidated:
- ❌ Removed separate "Analytics" category (moved to Dashboard)
- ❌ Removed individual report pages (consolidated into tabs)
- ❌ Removed card navigation pattern (direct tab access)
- ❌ Removed unnecessary report categories
