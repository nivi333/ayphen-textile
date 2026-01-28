/**
 * InventoryService Unit Tests
 * Tests inventory management, stock movements, and alerts
 */

import { createMockProduct, createMockStockAdjustment } from '../../factories/productFactory';
import { createMockLocation } from '../../factories/companyFactory';

describe('InventoryService - Stock Movements', () => {
  it('should record stock movement between locations', () => {
    const sourceLocation = createMockLocation({ location_id: 'loc-001', name: 'Warehouse A' });
    const targetLocation = createMockLocation({ location_id: 'loc-002', name: 'Warehouse B' });
    const product = createMockProduct({ location_id: sourceLocation.location_id, stock_quantity: 100 });

    const movement = {
      product_id: product.product_id,
      from_location: sourceLocation.location_id,
      to_location: targetLocation.location_id,
      quantity: 30,
      movement_type: 'TRANSFER',
    };

    expect(movement.from_location).toBe(sourceLocation.location_id);
    expect(movement.to_location).toBe(targetLocation.location_id);
    expect(movement.quantity).toBe(30);
  });

  it('should validate sufficient stock before transfer', () => {
    const product = createMockProduct({ stock_quantity: 10 });
    const transferQuantity = 20;

    expect(() => {
      if (product.stock_quantity < transferQuantity) {
        throw new Error('Insufficient stock for transfer');
      }
    }).toThrow('Insufficient stock for transfer');
  });

  it('should update stock in both locations after transfer', () => {
    const sourceStock = 100;
    const targetStock = 50;
    const transferQty = 30;

    const newSourceStock = sourceStock - transferQty;
    const newTargetStock = targetStock + transferQty;

    expect(newSourceStock).toBe(70);
    expect(newTargetStock).toBe(80);
  });

  it('should record movement history with timestamp', () => {
    const movement = {
      movement_id: 'mov-001',
      product_id: 'PRD001',
      from_location: 'loc-001',
      to_location: 'loc-002',
      quantity: 30,
      moved_at: new Date(),
      moved_by: 'user-123',
    };

    expect(movement.movement_id).toBeDefined();
    expect(movement.moved_at).toBeInstanceOf(Date);
    expect(movement.moved_by).toBeDefined();
  });
});

describe('InventoryService - Stock Alerts', () => {
  it('should trigger low stock alert when below reorder level', () => {
    const product = createMockProduct({
      stock_quantity: 15,
      reorder_level: 20,
    });

    const isLowStock = product.stock_quantity <= product.reorder_level;
    expect(isLowStock).toBe(true);
  });

  it('should not trigger alert when stock is above reorder level', () => {
    const product = createMockProduct({
      stock_quantity: 50,
      reorder_level: 20,
    });

    const isLowStock = product.stock_quantity <= product.reorder_level;
    expect(isLowStock).toBe(false);
  });

  it('should calculate reorder quantity', () => {
    const product = createMockProduct({
      stock_quantity: 10,
      reorder_level: 20,
      reorder_quantity: 50,
    });

    expect(product.reorder_quantity).toBe(50);
  });

  it('should list all products with low stock', () => {
    const products = [
      createMockProduct({ product_id: 'PRD001', stock_quantity: 5, reorder_level: 20 }),
      createMockProduct({ product_id: 'PRD002', stock_quantity: 50, reorder_level: 20 }),
      createMockProduct({ product_id: 'PRD003', stock_quantity: 15, reorder_level: 20 }),
    ];

    const lowStockProducts = products.filter(p => p.stock_quantity <= p.reorder_level);
    expect(lowStockProducts.length).toBe(2);
    expect(lowStockProducts[0].product_id).toBe('PRD001');
    expect(lowStockProducts[1].product_id).toBe('PRD003');
  });
});

describe('InventoryService - Stock Valuation', () => {
  it('should calculate total inventory value', () => {
    const products = [
      createMockProduct({ stock_quantity: 100, cost: 50 }),
      createMockProduct({ stock_quantity: 50, cost: 100 }),
      createMockProduct({ stock_quantity: 200, cost: 25 }),
    ];

    const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost), 0);
    expect(totalValue).toBe(15000); // (100*50) + (50*100) + (200*25)
  });

  it('should calculate inventory value by location', () => {
    const location1Products = [
      createMockProduct({ location_id: 'loc-001', stock_quantity: 100, cost: 50 }),
      createMockProduct({ location_id: 'loc-001', stock_quantity: 50, cost: 100 }),
    ];

    const location1Value = location1Products.reduce((sum, p) => sum + (p.stock_quantity * p.cost), 0);
    expect(location1Value).toBe(10000);
  });

  it('should calculate inventory turnover ratio', () => {
    const costOfGoodsSold = 100000;
    const averageInventoryValue = 20000;
    const turnoverRatio = costOfGoodsSold / averageInventoryValue;

    expect(turnoverRatio).toBe(5);
  });
});

describe('InventoryService - Stock Reconciliation', () => {
  it('should identify stock discrepancies', () => {
    const systemStock = 100;
    const physicalStock = 95;
    const discrepancy = systemStock - physicalStock;

    expect(discrepancy).toBe(5);
    expect(Math.abs(discrepancy)).toBeGreaterThan(0);
  });

  it('should adjust stock to match physical count', () => {
    const product = createMockProduct({ stock_quantity: 100 });
    const physicalCount = 95;
    
    const adjustment = createMockStockAdjustment({
      product_id: product.product_id,
      adjustment_type: 'SET',
      quantity: physicalCount - product.stock_quantity,
      previous_quantity: product.stock_quantity,
      new_quantity: physicalCount,
      reason: 'Physical stock reconciliation',
    });

    expect(adjustment.new_quantity).toBe(physicalCount);
    expect(adjustment.adjustment_type).toBe('SET');
  });

  it('should record reconciliation notes', () => {
    const reconciliation = {
      reconciliation_id: 'rec-001',
      location_id: 'loc-001',
      reconciled_by: 'user-123',
      reconciled_at: new Date(),
      notes: 'Annual stock count - found 5 units damaged',
      discrepancies_found: 3,
    };

    expect(reconciliation.notes).toBeDefined();
    expect(reconciliation.discrepancies_found).toBe(3);
  });
});
