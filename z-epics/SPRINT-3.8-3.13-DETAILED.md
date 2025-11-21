# 📋 Detailed Phases: Sprint 3.8 - 3.13
## Recommended Advanced Features for Textile ERP

---

## **PHASE 3.8: PRODUCTION PLANNING & SCHEDULING**

### **Purpose & Business Value**
Textile manufacturing requires complex production planning with multiple dependencies (yarn → fabric → dyeing → garment). Without proper planning, textile businesses face:
- Production bottlenecks and delays
- Inefficient resource utilization (machines, labor, materials)
- Missed delivery deadlines
- Excess inventory or stockouts
- Poor visibility into production capacity

**ROI**: 30% faster production cycles, 25% better resource utilization, 40% reduction in missed deadlines

---

### **Backend Tasks**

#### **Database Schema**
- [ ] **Create `production_orders` table** - Purpose: Link sales orders to production schedules
  - Fields: id, company_id, order_id (FK), production_order_number, start_date, end_date, status, priority, notes
  - Enums: ProductionStatus (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
  
- [ ] **Create `work_orders` table** - Purpose: Detailed production instructions for each manufacturing stage
  - Fields: id, production_order_id (FK), work_order_number, stage (SPINNING, WEAVING, DYEING, FINISHING, CUTTING, SEWING), location_id (FK), assigned_machine_id (FK), assigned_operator_id (FK), start_time, end_time, status, quantity_planned, quantity_completed
  
- [ ] **Create `production_schedules` table** - Purpose: Timeline-based production scheduling
  - Fields: id, company_id, work_order_id (FK), scheduled_start, scheduled_end, actual_start, actual_end, machine_id (FK), operator_id (FK), status
  
- [ ] **Create `material_requirements` table** - Purpose: MRP (Material Requirements Planning)
  - Fields: id, production_order_id (FK), product_id (FK), required_quantity, available_quantity, shortage_quantity, required_by_date, status
  
- [ ] **Create `capacity_planning` table** - Purpose: Track machine and labor capacity vs requirements
  - Fields: id, company_id, resource_type (MACHINE, LABOR), resource_id, date, available_capacity, allocated_capacity, utilization_percentage

#### **Services**
- [ ] **Create ProductionPlanningService** - Purpose: Core business logic for production planning
  - `createProductionOrder(tenantId, orderData)` - Convert sales order to production order
  - `generateWorkOrders(productionOrderId)` - Break down production into stages
  - `calculateMaterialRequirements(productionOrderId)` - MRP calculation
  - `checkCapacityAvailability(date, resourceType)` - Capacity planning
  - `scheduleProduction(workOrderId, scheduleData)` - Assign machines and operators
  - `updateProductionProgress(workOrderId, progress)` - Track real-time progress
  - `getProductionSchedule(tenantId, filters)` - Retrieve schedules with filters
  - `identifyBottlenecks(tenantId)` - Detect production constraints

#### **Controllers**
- [ ] **Create ProductionPlanningController** - Purpose: API endpoints for production planning
  - POST `/api/v1/production/orders` - Create production order
  - GET `/api/v1/production/orders` - List production orders
  - GET `/api/v1/production/orders/:id` - Get production order details
  - PUT `/api/v1/production/orders/:id` - Update production order
  - POST `/api/v1/production/work-orders` - Create work order
  - GET `/api/v1/production/schedules` - Get production schedule (Gantt data)
  - POST `/api/v1/production/capacity-check` - Check capacity availability
  - GET `/api/v1/production/mrp/:orderId` - Get material requirements
  - GET `/api/v1/production/bottlenecks` - Identify bottlenecks
  - Validation: Joi schemas for all request bodies

#### **Routes**
- [ ] **Create productionRoutes.ts** - Purpose: Route definitions with middleware
  - All routes behind `tenantIsolationMiddleware`
  - Role-based access: `requireRole(['OWNER', 'ADMIN', 'MANAGER'])`
  - Register under `/api/v1/production`

---

### **Frontend Tasks**

#### **Pages**
- [ ] **Create ProductionOrdersListPage** - Purpose: View and manage all production orders
  - Table with columns: Order#, Sales Order#, Product, Quantity, Start Date, End Date, Status, Progress, Actions
  - Filters: Status, Date range, Priority, Product
  - Actions: Create, View, Edit, Cancel, Print
  - Status badges with colors (Planned, In Progress, Completed, Cancelled)

- [ ] **Create ProductionSchedulePage** - Purpose: Visual Gantt chart for production scheduling
  - Gantt chart library (e.g., dhtmlx-gantt, react-gantt-chart)
  - Timeline view (daily, weekly, monthly)
  - Drag-and-drop scheduling
  - Resource allocation view (machines, operators)
  - Conflict detection (overlapping schedules)

- [ ] **Create CapacityPlanningPage** - Purpose: View and manage resource capacity
  - Calendar view with capacity vs allocation
  - Resource utilization charts (bar charts, heatmaps)
  - Capacity alerts (over-allocated, under-utilized)
  - Filters: Resource type, Date range, Location

- [ ] **Create MRPPage** - Purpose: Material Requirements Planning dashboard
  - Table: Product, Required Qty, Available Qty, Shortage, Required By, Status
  - Auto-generate purchase requisitions for shortages
  - Integration with inventory module
  - Alerts for critical shortages

#### **Components**
- [ ] **Create ProductionOrderFormDrawer** - Purpose: Create/edit production orders
  - Sections: Order Info, Product Details, Schedule, Resources
  - Fields: Sales Order dropdown, Product, Quantity, Priority, Start/End dates
  - Work order generation preview
  - Material requirements preview

- [ ] **Create WorkOrderCard** - Purpose: Display work order details in production schedule
  - Shows: Work Order#, Stage, Machine, Operator, Time, Progress
  - Status indicator, Progress bar
  - Quick actions: Start, Pause, Complete, View Details

- [ ] **Create GanttChart Component** - Purpose: Reusable Gantt chart for scheduling
  - Timeline rendering, Task bars, Dependencies
  - Drag-and-drop support, Zoom controls
  - Resource allocation view

#### **Services**
- [ ] **Create productionService.ts** - Purpose: Frontend API integration
  - `createProductionOrder(data)` - API call to create production order
  - `getProductionOrders(filters)` - Fetch production orders
  - `getProductionSchedule(filters)` - Fetch Gantt chart data
  - `checkCapacity(date, resourceType)` - Check capacity
  - `getMaterialRequirements(orderId)` - Fetch MRP data
  - `updateWorkOrderProgress(id, progress)` - Update progress
  - Error handling and loading states

---

### **User Stories**

| Role | Story | Acceptance Criteria |
|------|-------|---------------------|
| Production Manager | As a production manager, I want to create production orders from sales orders, so manufacturing can begin. | Production order created with work orders for each stage. Material requirements calculated. Capacity checked. |
| Production Planner | As a planner, I want to schedule production on a Gantt chart, so I can optimize machine utilization. | Drag-and-drop scheduling. Conflict detection. Resource allocation visible. Schedule saved successfully. |
| Factory Manager | As a factory manager, I want to see capacity utilization, so I can identify bottlenecks. | Capacity dashboard shows utilization %. Over-allocated resources highlighted. Bottleneck alerts displayed. |
| Purchase Manager | As a purchase manager, I want MRP to show material shortages, so I can order in time. | MRP table shows shortages. Auto-generate purchase requisitions. Integration with procurement module. |

---

### **Acceptance Criteria**
- [ ] Production orders can be created from sales orders
- [ ] Work orders generated for each manufacturing stage
- [ ] Material requirements calculated automatically (MRP)
- [ ] Gantt chart displays production schedule visually
- [ ] Drag-and-drop scheduling works without conflicts
- [ ] Capacity planning shows utilization percentages
- [ ] Bottleneck detection identifies constraints
- [ ] Real-time progress tracking for work orders
- [ ] Mobile-responsive for shop floor access
- [ ] Export schedules to PDF/Excel

---

## **PHASE 3.9: SUPPLIER & PROCUREMENT MANAGEMENT**

### **Purpose & Business Value**
Textile production depends heavily on timely raw material supply (yarn, dyes, chemicals, accessories). Poor supplier management leads to:
- Production delays due to stockouts
- Quality issues from unreliable suppliers
- Higher costs from poor negotiation
- Lack of supplier performance visibility
- Manual procurement processes

**ROI**: 20% cost savings through better negotiation, 30% reduction in stockouts, 40% faster procurement cycles

---

### **Backend Tasks**

#### **Database Schema**
- [ ] **Create `suppliers` table** - Purpose: Master database of all suppliers/vendors
  - Fields: id, company_id, supplier_code, supplier_name, contact_person, email, phone, address, city, state, country, pincode, payment_terms, credit_limit, rating, status, notes
  - Enums: SupplierStatus (ACTIVE, INACTIVE, BLACKLISTED)

- [ ] **Create `supplier_products` table** - Purpose: Products/materials supplied by each vendor
  - Fields: id, supplier_id (FK), product_id (FK), unit_price, minimum_order_quantity, lead_time_days, is_preferred

- [ ] **Create `purchase_requisitions` table** - Purpose: Material request workflow with approvals
  - Fields: id, company_id, requisition_number, requested_by (user_id FK), department, required_by_date, status, approval_status, approved_by, approval_date, notes
  - Enums: RequisitionStatus (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CONVERTED_TO_PO)

- [ ] **Create `purchase_requisition_items` table** - Purpose: Line items in requisition
  - Fields: id, requisition_id (FK), product_id (FK), quantity, unit_price, notes

- [ ] **Create `purchase_orders` table** - Purpose: Formal purchase orders to suppliers
  - Fields: id, company_id, po_number, supplier_id (FK), order_date, expected_delivery_date, status, payment_terms, total_amount, notes
  - Enums: POStatus (DRAFT, SENT, ACKNOWLEDGED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED)

- [ ] **Create `purchase_order_items` table** - Purpose: Line items in PO
  - Fields: id, po_id (FK), product_id (FK), quantity, unit_price, line_amount, received_quantity

- [ ] **Create `rfq_requests` table** - Purpose: Request for Quotations
  - Fields: id, company_id, rfq_number, title, description, required_by_date, status, created_by
  - Enums: RFQStatus (DRAFT, SENT, RESPONSES_RECEIVED, EVALUATED, CLOSED)

- [ ] **Create `rfq_responses` table** - Purpose: Supplier quotations
  - Fields: id, rfq_id (FK), supplier_id (FK), quoted_price, delivery_time, validity_date, terms, status

- [ ] **Create `goods_receipts` table** - Purpose: Incoming material inspection
  - Fields: id, company_id, gr_number, po_id (FK), supplier_id (FK), receipt_date, location_id (FK), inspector_id (user_id FK), quality_status, notes
  - Enums: QualityStatus (PASSED, FAILED, PARTIAL_ACCEPT)

- [ ] **Create `supplier_performance` table** - Purpose: Track supplier ratings and KPIs
  - Fields: id, supplier_id (FK), month, year, on_time_delivery_rate, quality_rating, response_time, total_orders, total_value

---

### **Services**
- [ ] **Create SupplierService** - Purpose: Supplier management business logic
  - `createSupplier(tenantId, data)` - Add new supplier
  - `getSuppliers(tenantId, filters)` - List suppliers with filters
  - `updateSupplier(supplierId, data)` - Update supplier info
  - `rateSupplier(supplierId, rating)` - Update supplier rating
  - `getSupplierPerformance(supplierId)` - Get performance metrics

- [ ] **Create ProcurementService** - Purpose: Procurement workflow logic
  - `createPurchaseRequisition(tenantId, data)` - Create PR
  - `approvePurchaseRequisition(prId, approverId)` - Approve PR
  - `convertPRtoPO(prId, supplierId)` - Convert approved PR to PO
  - `createPurchaseOrder(tenantId, data)` - Create PO
  - `sendPOToSupplier(poId)` - Email PO to supplier
  - `receiveMaterials(poId, receiptData)` - Record goods receipt
  - `createRFQ(tenantId, data)` - Create RFQ
  - `evaluateRFQResponses(rfqId)` - Compare quotations

---

### **Controllers**
- [ ] **Create SupplierController** - Purpose: Supplier API endpoints
  - POST `/api/v1/suppliers` - Create supplier
  - GET `/api/v1/suppliers` - List suppliers
  - GET `/api/v1/suppliers/:id` - Get supplier details
  - PUT `/api/v1/suppliers/:id` - Update supplier
  - GET `/api/v1/suppliers/:id/performance` - Get performance metrics
  - POST `/api/v1/suppliers/:id/rate` - Rate supplier

- [ ] **Create ProcurementController** - Purpose: Procurement API endpoints
  - POST `/api/v1/procurement/requisitions` - Create PR
  - GET `/api/v1/procurement/requisitions` - List PRs
  - POST `/api/v1/procurement/requisitions/:id/approve` - Approve PR
  - POST `/api/v1/procurement/purchase-orders` - Create PO
  - GET `/api/v1/procurement/purchase-orders` - List POs
  - POST `/api/v1/procurement/purchase-orders/:id/send` - Send PO
  - POST `/api/v1/procurement/goods-receipts` - Record receipt
  - POST `/api/v1/procurement/rfq` - Create RFQ
  - GET `/api/v1/procurement/rfq/:id/responses` - Get RFQ responses

---

### **Frontend Tasks**

#### **Pages**
- [ ] **Create SuppliersListPage** - Purpose: View and manage suppliers
- [ ] **Create PurchaseRequisitionsPage** - Purpose: Create and approve PRs
- [ ] **Create PurchaseOrdersPage** - Purpose: Manage POs
- [ ] **Create RFQManagementPage** - Purpose: RFQ workflow
- [ ] **Create GoodsReceiptPage** - Purpose: Record incoming materials
- [ ] **Create SupplierPerformancePage** - Purpose: Supplier analytics

#### **Components**
- [ ] **Create SupplierFormDrawer** - Purpose: Add/edit suppliers
- [ ] **Create PurchaseRequisitionFormDrawer** - Purpose: Create PR
- [ ] **Create PurchaseOrderFormDrawer** - Purpose: Create PO
- [ ] **Create RFQFormDrawer** - Purpose: Create RFQ
- [ ] **Create GoodsReceiptFormDrawer** - Purpose: Record receipt

---

## **PHASE 3.10: COSTING & PRICING MANAGEMENT**

### **Purpose & Business Value**
Textile products have complex costing (yarn cost, dyeing cost, labor, overheads). Accurate costing is essential for:
- Profitability analysis
- Competitive pricing
- Cost control and reduction
- Margin optimization
- Make-vs-buy decisions

**ROI**: 15% margin improvement, 25% better pricing decisions, 30% cost visibility

---

### **Backend Tasks**

#### **Database Schema**
- [ ] **Create `bill_of_materials` (BOM) table** - Purpose: Multi-level BOM for products
- [ ] **Create `cost_sheets` table** - Purpose: Detailed cost breakdown
- [ ] **Create `standard_costs` table** - Purpose: Set standard costs
- [ ] **Create `actual_costs` table** - Purpose: Track actual costs from production
- [ ] **Create `pricing_rules` table** - Purpose: Pricing strategies

---

## **PHASE 3.11: WAREHOUSE & LOGISTICS MANAGEMENT**

### **Purpose & Business Value**
Efficient warehouse management reduces handling costs and improves order fulfillment.

**ROI**: 40% faster fulfillment, 30% lower handling costs

---

## **PHASE 3.12: CUSTOMER RELATIONSHIP MANAGEMENT (CRM)**

### **Purpose & Business Value**
Manage long-term customer relationships, repeat orders, and custom requirements.

**ROI**: 25% increase in repeat orders, better customer retention

---

## **PHASE 3.13: FINANCIAL ACCOUNTING INTEGRATION**

### **Purpose & Business Value**
Seamless accounting integration for accurate reporting, tax compliance, and business insights.

**ROI**: Real-time financial visibility, tax compliance, audit readiness

---

## **IMPLEMENTATION PRIORITY**

### **Phase 1 (Must Have - Core Features)**
1. Sprint 3.6: Product Master & Inventory ⭐⭐⭐⭐⭐
2. Sprint 3.7: Machine Maintenance ⭐⭐⭐⭐⭐
3. Sprint 3.9: Supplier & Procurement ⭐⭐⭐⭐⭐

### **Phase 2 (Should Have - Advanced Features)**
4. Sprint 3.8: Production Planning ⭐⭐⭐⭐
5. Sprint 3.10: Costing & Pricing ⭐⭐⭐⭐
6. Sprint 3.11: Warehouse & Logistics ⭐⭐⭐⭐

### **Phase 3 (Nice to Have - Business Growth)**
7. Sprint 3.12: CRM ⭐⭐⭐
8. Sprint 3.13: Financial Accounting ⭐⭐⭐

---

**Total Estimated Effort**: 36-42 weeks with 8-10 person team  
**Budget**: $1.8M - $2.5M (full-featured textile ERP)
