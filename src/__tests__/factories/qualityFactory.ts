/**
 * Quality Test Data Factory
 * Provides consistent test data for quality control tests
 */

export const createMockQualityCheckpoint = (overrides = {}) => ({
  id: 'checkpoint-uuid-123',
  checkpoint_id: 'QC001',
  company_id: 'company-123',
  location_id: 'loc-123',
  order_id: 'order-123',
  checkpoint_type: 'INCOMING_MATERIAL',
  checkpoint_name: 'Raw Material Inspection',
  inspector_name: 'John Inspector',
  inspection_date: new Date('2024-01-15'),
  status: 'PENDING',
  overall_score: null,
  notes: 'Initial inspection',
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15'),
  batch_number: 'BATCH-001',
  lot_number: 'LOT-001',
  product_id: 'prod-123',
  sample_size: 10,
  tested_quantity: 100,
  total_batch: 1000,
  is_active: true,
  ...overrides,
});

export const createMockQualityCheckpointData = (overrides = {}) => ({
  checkpointType: 'INCOMING_MATERIAL',
  checkpointName: 'Raw Material Inspection',
  inspectorName: 'John Inspector',
  inspectionDate: new Date('2024-01-15'),
  orderId: 'order-123',
  locationId: 'loc-123',
  productId: 'prod-123',
  batchNumber: 'BATCH-001',
  lotNumber: 'LOT-001',
  sampleSize: 10,
  testedQuantity: 100,
  totalBatch: 1000,
  ...overrides,
});

export const createMockQualityDefect = (overrides = {}) => ({
  id: 'defect-uuid-123',
  defect_id: 'DEF001',
  company_id: 'company-123',
  checkpoint_id: 'checkpoint-uuid-123',
  defect_category: 'FABRIC',
  defect_type: 'Color Mismatch',
  severity: 'MAJOR',
  quantity: 5,
  description: 'Color does not match specification',
  image_url: 'https://example.com/defect.jpg',
  resolution_status: 'OPEN',
  resolution_notes: null,
  resolved_by: null,
  resolved_at: null,
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15'),
  affected_items: 50,
  batch_number: 'BATCH-001',
  lot_number: 'LOT-001',
  product_id: 'prod-123',
  is_active: true,
  ...overrides,
});

export const createMockQualityDefectData = (overrides = {}) => ({
  checkpointId: 'checkpoint-uuid-123',
  defectCategory: 'FABRIC',
  defectType: 'Color Mismatch',
  severity: 'MAJOR',
  quantity: 5,
  description: 'Color does not match specification',
  productId: 'prod-123',
  batchNumber: 'BATCH-001',
  lotNumber: 'LOT-001',
  affectedItems: 50,
  ...overrides,
});

export const createMockQualityMetric = (overrides = {}) => ({
  id: 'metric-uuid-123',
  metric_id: 'QM001',
  company_id: 'company-123',
  checkpoint_id: 'checkpoint-uuid-123',
  metric_name: 'Thread Count',
  metric_value: 180,
  unit_of_measure: 'threads/inch',
  min_threshold: 150,
  max_threshold: 200,
  is_within_range: true,
  notes: 'Within acceptable range',
  created_at: new Date('2024-01-15'),
  ...overrides,
});

export const createMockQualityMetricData = (overrides = {}) => ({
  checkpointId: 'checkpoint-uuid-123',
  metricName: 'Thread Count',
  metricValue: 180,
  unitOfMeasure: 'threads/inch',
  minThreshold: 150,
  maxThreshold: 200,
  ...overrides,
});

export const createMockComplianceReport = (overrides = {}) => ({
  id: 'compliance-uuid-123',
  report_id: 'CR001',
  company_id: 'company-123',
  report_type: 'ISO_9001',
  report_date: new Date('2024-01-31'),
  auditor_name: 'Jane Auditor',
  certification: 'ISO 9001:2015',
  validity_period: '3 years',
  status: 'COMPLIANT',
  findings: 'All requirements met',
  recommendations: 'Continue current practices',
  document_url: 'https://example.com/report.pdf',
  created_at: new Date('2024-01-31'),
  updated_at: new Date('2024-01-31'),
  report_code: 'ISO-2024-001',
  expiry_date: new Date('2027-01-31'),
  is_active: true,
  ...overrides,
});

export const createMockComplianceReportData = (overrides = {}) => ({
  reportType: 'ISO_9001',
  reportDate: new Date('2024-01-31'),
  auditorName: 'Jane Auditor',
  certification: 'ISO 9001:2015',
  validityPeriod: '3 years',
  status: 'COMPLIANT',
  findings: 'All requirements met',
  recommendations: 'Continue current practices',
  ...overrides,
});

export const createMockDefectComment = (overrides = {}) => ({
  id: 'comment-uuid-123',
  defect_id: 'defect-uuid-123',
  company_id: 'company-123',
  user_id: 'user-123',
  comment: 'Investigating root cause',
  created_at: new Date('2024-01-15T10:00:00'),
  updated_at: new Date('2024-01-15T10:00:00'),
  ...overrides,
});

export const createMockCheckpointWithDefects = (overrides = {}) => ({
  ...createMockQualityCheckpoint(overrides),
  defects: [
    createMockQualityDefect(),
    createMockQualityDefect({
      id: 'defect-uuid-124',
      defect_id: 'DEF002',
      defect_category: 'STITCHING',
      defect_type: 'Loose Stitching',
      severity: 'MINOR',
      quantity: 2,
    }),
  ],
});

export const createMockCheckpointWithMetrics = (overrides = {}) => ({
  ...createMockQualityCheckpoint(overrides),
  metrics: [
    createMockQualityMetric(),
    createMockQualityMetric({
      id: 'metric-uuid-124',
      metric_id: 'QM002',
      metric_name: 'Fabric Weight',
      metric_value: 250,
      unit_of_measure: 'gsm',
      min_threshold: 200,
      max_threshold: 300,
    }),
  ],
});

export const createMockPassedCheckpoint = (overrides = {}) => ({
  ...createMockQualityCheckpoint({
    status: 'PASSED',
    overall_score: 95.5,
    notes: 'All quality checks passed',
    ...overrides,
  }),
});

export const createMockFailedCheckpoint = (overrides = {}) => ({
  ...createMockQualityCheckpoint({
    status: 'FAILED',
    overall_score: 45.0,
    notes: 'Multiple defects found',
    ...overrides,
  }),
});

export const createMockResolvedDefect = (overrides = {}) => ({
  ...createMockQualityDefect({
    resolution_status: 'RESOLVED',
    resolution_notes: 'Defective batch replaced',
    resolved_by: 'user-123',
    resolved_at: new Date('2024-01-16'),
    ...overrides,
  }),
});

export const createMockOutOfRangeMetric = (overrides = {}) => ({
  ...createMockQualityMetric({
    metric_value: 250,
    min_threshold: 150,
    max_threshold: 200,
    is_within_range: false,
    notes: 'Value exceeds maximum threshold',
    ...overrides,
  }),
});

export const createMockNonCompliantReport = (overrides = {}) => ({
  ...createMockComplianceReport({
    status: 'NON_COMPLIANT',
    findings: 'Several non-conformities identified',
    recommendations: 'Corrective actions required',
    ...overrides,
  }),
});
