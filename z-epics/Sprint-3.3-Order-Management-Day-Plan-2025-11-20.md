# Sprint 3.3 – Order Management System

**Date:** 2025-11-20  
**Time Window:** 9:30 AM – 6:00 PM  
**Source Epic:** `z-epics/Textile-Application.md` – *Sprint 3.3: Order Management System*
“All new backend and frontend code for Sprint 3.3 must strictly follow existing patterns for naming, architecture, UI theme, SCSS, buttons (GradientButton), Drawers, and validation.”
## Scope for Today

Focus only on **Sprint 3.3: Order Management System** tasks (above sprints are already marked as completed):

- **Backend – Order Processing System**
  - Sales order management
  - Order fulfillment workflow
  - Delivery scheduling
  - Invoice generation with default location integration
  - Bill generation with head office/default location details
  - Purchase Order (PO) creation with location-based addressing
  - Financial document location referencing system

- **Frontend – Order Management Interface**
  - Order creation and editing
  - Order status tracking
  - Customer management
  - Delivery management

### Notes for Understanding 

- **Architecture & patterns already in place**
  - Backend: Node/Express/TypeScript with Prisma, multi-tenant via `tenantIsolationMiddleware`, services/controllers with Joi validation, and strong RBAC.
  - Frontend: Vite/React/TypeScript with `MainLayout`, `Sidebar`, compact AntD `Table` screens, `GradientButton` for primary actions, and Drawer-based forms for 5–20 fields.
- **Field naming in this document**
  - All fields are described in camelCase (for easier reading). The actual database layer already follows existing snake_case conventions.

The goal is to: **design and implement Sprint 3.3 Order Management features while strictly following the existing project architecture, naming conventions, UI theme, and component patterns**.

---

## Combined Implementation Flow (Backend + Frontend)

This section combines backend and frontend work into a single flow so both move together, without time-boxing. All new work must follow existing patterns (naming, architecture, UI theme, SCSS, `GradientButton`, Drawers, validation) and respect multi-tenant rules (always scoped by `company_id` / `tenantId`).

### 2. Orders Data Model & Core APIs (Backend)

- **Schema confirmation (conceptual view)** – verify existing models align with design:
  - `OrderStatus` enum with values: DRAFT, CONFIRMED, IN_PRODUCTION, READY_TO_SHIP, SHIPPED, DELIVERED, CANCELLED.
  - `Order` fields (camelCase in this document):
    - `id`, `orderId`, `companyId`, `customerName`, `customerCode?`, `status`, `orderDate`, `deliveryDate?`, `currency`, `totalAmount`, `notes?`, `locationId?`, `createdAt`, `updatedAt`.
  - `OrderItem` fields:
    - `id`, `orderId`, `lineNumber`, `itemCode`, `description?`, `quantity`, `unitOfMeasure`, `unitPrice`, `lineAmount`.
- **DTO & service input shapes (camelCase)** – confirm / extend `src/types/index.ts`:
  - `CreateOrderData`: `customerName`, `customerCode?`, `orderDate`, `deliveryDate?`, `currency?`, `notes?`, `locationId?`, `items[]`.
  - Each item: `lineNumber?`, `itemCode`, `description?`, `quantity`, `unitOfMeasure`, `unitPrice`.
- **Minimal vertical slice APIs** – ensure implemented and wired:
  - `POST /api/v1/orders` → `OrderController.createOrder` → `OrderService.createOrder(tenantId, data)`.
  - `GET /api/v1/orders` → `OrderController.getOrders` → `OrderService.getOrders(tenantId, filters)`.
- **Validation & error handling (Joi + controller)**
  - Request body validation (already present) must enforce:
    - `customerName` required (1–255 chars).
    - `orderDate` required; `deliveryDate` optional but `>= orderDate`.
    - `items` array required, `min(1)`; each item: `itemCode`, `quantity > 0`, `unitOfMeasure`, `unitPrice >= 0`.
  - Standard 400 for validation errors, 500 for unexpected errors, mirroring company/location controllers.
- **Tenant scoping & location validation**
  - In `OrderService.createOrder` ensure:
    - All writes use `company_id = tenantId`.
    - If `locationId` provided, confirm `company_locations.id = locationId AND company_id = tenantId`.
- **Mapping rules (response DTOs)**
  - Orders use camelCase fields: `orderId`, `companyId`, `customerName`, `customerCode`, `status`, `orderDate`, `deliveryDate`, `currency`, `totalAmount`, `notes`, `locationId`, `createdAt`, `updatedAt`.
  - Order items use camelCase fields: `lineNumber`, `itemCode`, `description`, `quantity`, `unitOfMeasure`, `unitPrice`, `lineAmount`.

### 3. Orders List & Navigation (Frontend)

- **Sidebar navigation**
  - Confirm `Sidebar.tsx` already contains Sales & Orders group with:
    - Menu item: key `/orders`, icon `FileTextOutlined`, label `Orders`.
  - Ensure selecting `/orders` correctly highlights the menu (via `getSelectedKeys` / `getOpenKeys`).

- **Protected routes**
  - Add React Router entries using existing protected route pattern:
    - `/orders` → `OrdersListPage` (wrapped in `MainLayout` + `ProtectedRoute` with tenant context required).
    - `/orders/:orderId` → `OrderDetailPage` (same guards).
  - Ensure routes only render when `currentCompany` (tenant) is set; otherwise redirect to `/companies`.

- **OrdersListPage UI (table screen)**
  - Create `frontend/src/pages/OrdersListPage.tsx` mirroring `LocationListPage`:
    - Wrap with `MainLayout`.
    - Use `useHeader()` to set header actions to a small `GradientButton` labelled `Create Order` (opens drawer).
    - Use AntD `Table` with compact row height.
  - **Table columns (camelCase → snake_case)**
    - `orderId` – Sales order number (SO001…).
    - `customerName`.
    - `status` – rendered as AntD `Tag` using color map per `OrderStatus`.
    - `orderDate` – formatted date.
    - `deliveryDate` – formatted or `—`.
    - `locationName` – resolved from the related location via existing locations endpoint (optional; show badge like “HQ / Branch”).
    - `totalAmount` – right-aligned, with `currency` prefix/suffix.
    - `actions` – More menu (View details, Edit, Change status) using AntD `Dropdown`/`MoreOutlined`.
  - **States & UX**
    - Loading: use `Spin` / table loading prop while fetching.
    - Empty state: AntD `Empty` with message “No orders found” and a `GradientButton` to create the first order.
    - Pagination: page-based (e.g., 10/25/50 per page) following existing table config constants.

- **Frontend orderService**
  - Create `frontend/src/services/orderService.ts` following auth/company/location services:
    - `getOrders(params?: { status?, from?, to?, customerName? })` → `GET /orders`.
    - `createOrder(payload: CreateOrderPayload)` → `POST /orders`.
    - Use `VITE_API_BASE_URL`, attach Authorization header, handle JSON + error mapping.

### 4. Order Creation & Editing (Drawer-Based UX)

- **OrderFormDrawer component**
  - Create `frontend/src/components/orders/OrderFormDrawer.tsx` similar to `CompanyCreationDrawer` / `LocationDrawer`:
    - AntD `Drawer` with ~720px width, single scrollable form.
    - Sections: **Order Info**, **Items**, **Delivery Details**.
    - Footer: left-aligned `Cancel`, right-aligned `GradientButton` primary (`Create Order` / `Update Order`).
  - Trigger from `OrdersListPage` via header `GradientButton` and from `OrderDetailPage` (Edit button).

- **Form fields (camelCase with validation)**
  - **Order Info**:
    - `customerName`
      - Required, string, 1–255 chars.
    - `customerCode`
      - Optional, string, max 100 chars.
    - `orderDate`
      - Required, Date; cannot be in far past/future beyond reasonable bounds.
    - `currency`
      - Optional, default `INR`, string max 10.
    - `notes`
      - Optional, string, max 1000 chars.
    - `locationId`
      - Optional; if set must be one of existing company locations.
  - **Items**:
    - `items` (array, min 1).
    - Each item:
      - `itemCode` – required, 1–255 chars.
      - `description` – optional, max 500 chars.
      - `quantity` – required, number > 0.
      - `unitOfMeasure` – required, 1–50 chars.
      - `unitPrice` – required, number ≥ 0.
      - `lineNumber` – optional on input, auto-assigned in backend.
  - **Delivery Details**:
    - `deliveryDate` – optional, must be ≥ `orderDate`.
    - Reuse `Location` selector (dropdown) bound to `locationId` for shipping location.

- **Form plumbing & submission**
  - Use AntD `Form` (or existing form pattern) with validation rules mirroring Joi schema.
  - On submit:
    - Call `orderService.createOrder`.
    - Show loading state on submit button.
    - On success: close drawer, show success message, refresh orders list.
    - On validation/API error: show AntD `message.error` and mark invalid fields.

### 5. Order Workflow & Status Tracking

- **Backend: status transitions**
  - Extend `OrderService` with:
    - `getOrderById(companyId, orderId)` – for detail view.
    - `updateOrderStatus(companyId, orderId, nextStatus)` – encapsulates transition rules:
      - Allowed flow: `DRAFT → CONFIRMED → IN_PRODUCTION → READY_TO_SHIP → SHIPPED → DELIVERED`.
      - `CANCELLED` allowed from `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY_TO_SHIP`, `SHIPPED` (but not after `DELIVERED`).
  - Add controller + route:
    - `PATCH /api/v1/orders/:orderId/status` with Joi body: `{ status: OrderStatus }`.
    - Enforce tenant via `tenantId` and restrict with `requireRole(['OWNER','ADMIN','MANAGER'])` if needed.

- **Frontend: status UI**
  - In `OrdersListPage`:
    - Render `status` column as AntD `Tag` with color map per status.
    - Add action menu entries: `Confirm`, `Start Production`, `Ready to Ship`, `Mark as Shipped`, `Mark as Delivered`, `Cancel`.
    - Disable / hide actions that are invalid for current status.
  - `OrderDetailPage`:
    - Show prominent status badge.
    - Show small stepper/visual timeline for statuses (optional in this sprint as simple list of steps with current highlighted).
  - On action click:
    - Call `PATCH /orders/:orderId/status` via `orderService.updateStatus`.
    - On success: refresh list/detail.

### 6. Delivery Scheduling (Backend + Frontend)

- **Backend rules**
  - Keep `delivery_date` as optional on `orders` (already in schema).
  - In `OrderController` + Joi schema:
    - Enforce `deliveryDate >= orderDate`.
    - Optionally, later enforce business rules (e.g., cannot deliver before `SHIPPED`).

- **Frontend form & display**
  - In `OrderFormDrawer`:
    - Use AntD `DatePicker` for `deliveryDate` with minDate bound to `orderDate`.
    - Use dropdown/select for `locationId` bound to existing `locationService.getLocations()` (display `name`, show `HQ`/`Default` badges in options if possible).
  - In `OrdersListPage` & `OrderDetailPage`:
    - Show `deliveryDate` column/field.
    - Show shipping location (location name + badges) derived from `locationId` and cached locations.

### 7. Location-Aware Financial Documents (Minimal Implementation)

- **Backend data model**
  - Add `financialDocuments` data model (Prisma schema will mirror these fields in snake_case):
    - `id` (UUID, PK), `documentId` (e.g., INV001/BILL001/PO001, unique per company + type), `companyId`, `documentType` (enum: INVOICE, BILL, PURCHASE_ORDER), `orderId?` (for invoices linked to orders), `locationId`, `partyName`, `partyCode?`, `issueDate`, `dueDate?`, `currency`, `subtotalAmount`, `taxAmount`, `totalAmount`, `notes?`, `createdAt`, `updatedAt`.
  - Ensure `locationId` always points to a location that belongs to the same company.

- **Minimal backend flows for this sprint**
  - Implement `FinancialDocumentService` with at least:
    - `createInvoiceForOrder(companyId, orderId, overrides?)`:
      - Resolve order by `company_id` + `orderId`.
      - Resolve `location_id`:
        - If explicit location passed → validate belongs to company.
        - Else → look up default HQ location (`is_default = true` AND `is_headquarters = true`).
      - Compute amounts from order items.
    - Expose via `POST /api/v1/financial-documents/invoices` (or similar).

- **Frontend hooks**
  - From `OrderDetailPage`:
    - Add `GradientButton` “Generate Invoice” (OWNER/ADMIN only) that calls invoice creation endpoint.
    - Show basic invoice summary (document id, issue date, total, location name) in a small panel or table.

### 8. Customer & Delivery Representation

- **Customer representation (no separate module yet)**
  - Treat customer data as order-level fields for Sprint 3.3:
    - `customerName` – required.
    - `customerCode` – optional identifier.
  - Always display these on Orders list and detail screens.

- **Delivery representation**
  - Keep delivery information embedded in `orders`:
    - `deliveryDate`.
    - `locationId` – links to company locations.
  - Reuse existing address/location formatting from Location screens for display in Order detail.

### 9. Sprint 3.3 Wrap-Up

- Use the Tracking Template below to mark each backend/frontend bullet as:
  - ✅ Implemented
  - 🔶 Partially implemented
  - ⭕ Not started
- Summarize remaining gaps and next Sprint candidates from `Textile-Application.md` (e.g., Quality Control, further textile operations) using the same combined backend+frontend approach.

## Tracking Template (Fill During the Day)

### Backend – Order Processing System
- [x] Sales order management – Notes: Minimal vertical slice implemented: POST /api/v1/orders (create sales order with items, totals, status) and GET /api/v1/orders (list tenant orders) using new orders/order_items tables scoped by company_id (tenantId). OrderService + OrderController structure, Joi validation, and route wiring mirror existing company/location modules; implementation completed.
- [x] Order fulfillment workflow – Notes: Order status lifecycle implemented with OrderService.getOrderById, updateOrder, and updateOrderStatus enforcing allowed transitions (DRAFT → CONFIRMED → IN_PRODUCTION → READY_TO_SHIP → SHIPPED → DELIVERED, plus CANCELLED from earlier states). Routes added: GET /api/v1/orders/:orderId, PUT /api/v1/orders/:orderId, PATCH /api/v1/orders/:orderId/status with Joi validation and role-based access.
- [x] Delivery scheduling – Notes: Orders model extended with deliveryDate and shipping metadata (shippingCarrier, trackingNumber, shippingMethod, deliveryWindowStart, deliveryWindowEnd). Create/update and status APIs accept and persist these fields, enabling delivery scheduling tied to order lifecycle; implementation completed.
- [x] Invoice generation with default location integration – Notes: Shared financial_documents model added with document_type = INVOICE and location_id FK to company_locations. FinancialDocumentService.createInvoiceForOrder resolves the company’s default HQ location (is_default & is_headquarters) when no location is provided and stores it for rendering invoice “from” details; implementation completed.
- [x] Bill generation with head office/default location details – Notes: Bills are stored as financial_documents rows with document_type = BILL, always linked to the company’s HQ/default location_id via FinancialDocumentService.createBill so bills consistently use head office address/contact_info; implementation completed.
- [x] PO creation with location-based addressing – Notes: Purchase orders are stored as financial_documents rows with document_type = PURCHASE_ORDER and require an explicit locationId pointing to the receiving branch/warehouse/factory in company_locations, enforced by FinancialDocumentService.createPurchaseOrder; implementation completed.
- [x] Financial document location referencing system – Notes: All financial documents store location_id (FK to company_locations) and rely on existing location fields for address rendering. New FinancialDocumentService, controller, and /api/v1/financial-documents routes follow existing module patterns with tenant scoping and role-based access; implementation completed.

### Frontend – Order Management Interface
- [x] Order creation and editing – Notes: Implemented OrdersListPage with header GradientButton that opens an OrderFormDrawer component. Drawer layout follows existing Company/Location drawers with sections for Order Info, Items, and Delivery, cancel + primary GradientButton actions, and AntD Form validation mirroring backend Joi rules; create and edit flows call the new orderService.
- [x] Order status tracking – Notes: OrdersListPage uses an AntD Table showing order number, customer, status tag, dates, location, and total. Status tags map visually to the OrderStatus enum, and per-row actions allow valid next status transitions via PATCH /api/v1/orders/:orderId/status, refreshing the table on success.
- [x] Customer management – Notes: For Sprint 3.3, customerName and customerCode are captured on the OrderFormDrawer and displayed in the Orders list, matching the backend model without introducing a separate customers module; future dedicated customer screens can reuse these patterns.
- [x] Delivery management – Notes: Delivery information (deliveryDate, shipping location, carrier, tracking, shippingMethod, delivery windows) is captured within the OrderFormDrawer and surfaced on the Orders list via deliveryDate and resolved location name (including HQ/Default badges), aligning the UI with the backend delivery scheduling design.

Use this section to quickly mark what becomes **completed**, **partial**, or **pending** as we work through the prompts.
