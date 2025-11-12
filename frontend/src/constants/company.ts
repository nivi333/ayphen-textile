// Company-related UI text constants
export const COMPANY_TEXT = {
  // Page titles and headings
  PAGE_TITLE: 'Select Company / Role',
  WELCOME_MESSAGE: 'Welcome to {companyName}',
  SUBTITLE: 'Manage your textile manufacturing operations',

  // Button labels
  ADD_COMPANY: 'Add Company',
  LOGOUT: 'Logout',
  SAVE: 'Save',
  CANCEL: 'Cancel',

  // Tab labels
  OWNER_TAB: 'Owner',
  ROLES_TAB: 'Roles',

  // Empty states
  NO_COMPANIES_FOUND: 'No companies found',
  NO_COMPANY_CREATED: 'No company created',

  // Status messages
  COMPANY_SWITCHED_SUCCESS: 'Company switched successfully',
  LOGGED_OUT_SUCCESS: 'Logged out successfully',
  COMPANY_CREATED_SUCCESS: 'Company created successfully',
  COMPANY_CREATED_WARNING: 'Company created but failed to refresh list. Please refresh the page.',

  // Error messages
  SWITCH_COMPANY_ERROR: 'Failed to switch company',
  LOGOUT_ERROR: 'Failed to logout. Please try again.',

  // Loading messages
  LOADING_COMPANIES: 'Loading companies...',

  // Modal messages
  LOGOUT_CONFIRM_TITLE: 'Confirm Logout',
  LOGOUT_CONFIRM_CONTENT: 'Are you sure you want to logout? You will be redirected to the login page.',
  LOGOUT_CONFIRM_OK: 'Yes, Logout',
  LOGOUT_CONFIRM_CANCEL: 'Cancel',

  // Form labels
  COMPANY_NAME: 'Company Name',
  INDUSTRY: 'Industry',
  COUNTRY: 'Country',
  DEFAULT_LOCATION: 'Default Location',
  DESCRIPTION: 'Description',
  LOGO: 'Company Logo',
  INVENTORY: 'Inventory',
  ADD_INVENTORY_ITEM: 'Add Inventory Item',
  INVENTORY_ITEMS: 'Inventory Items',
  INVENTORY_SUMMARY: 'Inventory Summary',
  TOTAL_ITEMS: 'Total Items',
  TOTAL_STOCK_VALUE: 'Total Stock Value',
  TOTAL_STOCK_QUANTITY: 'Total Stock Quantity',
  LOW_STOCK_ALERTS: 'Low Stock Alerts',
  SEARCH_INVENTORY: 'Search inventory...',
  FILTER_BY_CATEGORY: 'Filter by category',
  SHOW_LOW_STOCK_ONLY: 'Show Low Stock Only',
  SHOW_ALL_ITEMS: 'Show All Items',
  REFRESH_DATA: 'Refresh Data',
  ITEM_DETAILS: 'Item Details',
  STOCK_LEVELS: 'Stock Levels',
  UNIT_COST: 'Unit Cost',
  QUALITY_STATUS: 'Quality Status',
  CURRENT_STOCK: 'Current Stock',
  AVAILABLE_STOCK: 'Available Stock',
  MINIMUM_STOCK_LEVEL: 'Minimum Stock Level',
  REORDER_POINT: 'Reorder Point',
  FIBER_TYPE: 'Fiber Type',
  YARN_COUNT: 'Yarn Count',
  GSM: 'GSM',
  FABRIC_TYPE: 'Fabric Type',
  COLOR: 'Color',
  WIDTH_METERS: 'Width (meters)',
  UNIT_OF_MEASURE: 'Unit of Measure',
  TEXTILE_SPECIFICATIONS: 'Textile Specifications',
  RAW_MATERIAL: 'Raw Material',
  WORK_IN_PROGRESS: 'Work in Progress',
  FINISHED_GOODS: 'Finished Goods',
  CONSUMABLES: 'Consumables',
  PACKAGING: 'Packaging',
  METER: 'Meter',
  KG: 'Kilogram',
  PIECE: 'Piece',
  ROLL: 'Roll',
  COTTON: 'Cotton',
  SILK: 'Silk',
  WOOL: 'Wool',
  POLYESTER: 'Polyester',
  NYLON: 'Nylon',
  WOVEN: 'Woven',
  KNITTED: 'Knitted',
  NON_WOVEN: 'Non-woven',
  WHITE: 'White',
  BLACK: 'Black',
  NAVY: 'Navy',
  RED: 'Red',
  GREEN: 'Green',
  YELLOW: 'Yellow',
  BLUE: 'Blue',
  PURPLE: 'Purple',
  PINK: 'Pink',
  GRAY: 'Gray',
  BROWN: 'Brown',
  BEIGE: 'Beige',

  // Dashboard stats
  TOTAL_PRODUCTS: 'Total Products',
  ACTIVE_ORDERS: 'Active Orders',
  TEAM_MEMBERS: 'Team Members',
  MONTHLY_REVENUE: 'Monthly Revenue',

  // Quick actions
  ADD_PRODUCT: 'Add Product',
  NEW_ORDER: 'New Order',
  INVITE_TEAM: 'Invite Team',
  VIEW_REPORTS: 'Reports',

  // Action descriptions
  ADD_PRODUCT_DESC: 'Create new product inventory',
  NEW_ORDER_DESC: 'Create production order',
  INVITE_TEAM_DESC: 'Add team members',
  VIEW_REPORTS_DESC: 'View analytics',
} as const;

// Role constants
export const USER_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

// Industry options for company creation
export const INDUSTRY_OPTIONS = [
  { label: 'Textile Manufacturing', value: 'textile_manufacturing' },
  { label: 'Garment Production', value: 'garment_production' },
  { label: 'Fabric Processing', value: 'fabric_processing' },
  { label: 'Knitting & Weaving', value: 'knitting_weaving' },
  { label: 'Dyeing & Finishing', value: 'dyeing_finishing' },
  { label: 'Other', value: 'other' },
] as const;

// Country options
export const COUNTRY_OPTIONS = [
  { label: 'India', value: 'IN' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Germany', value: 'DE' },
  { label: 'Italy', value: 'IT' },
  { label: 'China', value: 'CN' },
  { label: 'Japan', value: 'JP' },
  { label: 'Other', value: 'OTHER' },
] as const;
