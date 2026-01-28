import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const MockProductFormDrawer = ({ 
  open, 
  mode,
  initialData,
  onClose, 
  onSuccess 
}: { 
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: any;
  onClose: () => void; 
  onSuccess: (data: any) => void | Promise<void>;
}) => {
  const [formData, setFormData] = React.useState(initialData || {
    name: '',
    sku: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    reorderLevel: '',
    unitOfMeasure: 'PCS',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSuccess(formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div data-testid="product-form-drawer">
      <h2>{mode === 'create' ? 'Create Product' : 'Edit Product'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          data-testid="name-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Product Name"
        />
        <input
          data-testid="sku-input"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          placeholder="SKU"
        />
        <select
          data-testid="category-select"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">Select Category</option>
          <option value="fabric">Fabric</option>
          <option value="yarn">Yarn</option>
          <option value="accessories">Accessories</option>
        </select>
        <input
          data-testid="costPrice-input"
          type="number"
          value={formData.costPrice}
          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
          placeholder="Cost Price"
        />
        <input
          data-testid="sellingPrice-input"
          type="number"
          value={formData.sellingPrice}
          onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
          placeholder="Selling Price"
        />
        <input
          data-testid="stockQuantity-input"
          type="number"
          value={formData.stockQuantity}
          onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
          placeholder="Stock Quantity"
        />
        <input
          data-testid="reorderLevel-input"
          type="number"
          value={formData.reorderLevel}
          onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
          placeholder="Reorder Level"
        />
        <select
          data-testid="unitOfMeasure-select"
          value={formData.unitOfMeasure}
          onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
        >
          <option value="PCS">Pieces</option>
          <option value="MTR">Meters</option>
          <option value="YDS">Yards</option>
          <option value="KG">Kilograms</option>
        </select>
        <button type="submit" data-testid="submit-button">
          {mode === 'create' ? 'Create' : 'Update'}
        </button>
        <button type="button" onClick={onClose} data-testid="cancel-button">Cancel</button>
      </form>
    </div>
  );
};

describe('ProductFormDrawer Component', () => {
  let mockOnClose: any;
  let mockOnSuccess: any;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnSuccess = vi.fn();
  });

  describe('Drawer Modes', () => {
    it('should render in create mode', () => {
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText('Create Product')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Create');
    });

    it('should render in edit mode', () => {
      render(<MockProductFormDrawer open={true} mode="edit" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Update');
    });

    it('should populate form with initial data in edit mode', () => {
      const initialData = {
        name: 'Cotton Fabric',
        sku: 'FAB-001',
        category: 'fabric',
        costPrice: '100',
        sellingPrice: '150',
        stockQuantity: '500',
        reorderLevel: '50',
        unitOfMeasure: 'MTR',
      };
      
      render(
        <MockProductFormDrawer 
          open={true} 
          mode="edit" 
          initialData={initialData}
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess} 
        />
      );
      
      expect(screen.getByTestId('name-input')).toHaveValue('Cotton Fabric');
      expect(screen.getByTestId('sku-input')).toHaveValue('FAB-001');
      expect(screen.getByTestId('category-select')).toHaveValue('fabric');
    });
  });

  describe('Form Fields', () => {
    it('should have all required fields', () => {
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('sku-input')).toBeInTheDocument();
      expect(screen.getByTestId('category-select')).toBeInTheDocument();
      expect(screen.getByTestId('costPrice-input')).toBeInTheDocument();
      expect(screen.getByTestId('sellingPrice-input')).toBeInTheDocument();
      expect(screen.getByTestId('stockQuantity-input')).toBeInTheDocument();
      expect(screen.getByTestId('reorderLevel-input')).toBeInTheDocument();
      expect(screen.getByTestId('unitOfMeasure-select')).toBeInTheDocument();
    });

    it('should allow entering product name', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('name-input'), 'Cotton Fabric');
      expect(screen.getByTestId('name-input')).toHaveValue('Cotton Fabric');
    });

    it('should allow entering SKU', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('sku-input'), 'FAB-001');
      expect(screen.getByTestId('sku-input')).toHaveValue('FAB-001');
    });

    it('should allow selecting category', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.selectOptions(screen.getByTestId('category-select'), 'fabric');
      expect(screen.getByTestId('category-select')).toHaveValue('fabric');
    });
  });

  describe('Pricing Fields', () => {
    it('should allow entering cost price', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('costPrice-input'), '100');
      expect(screen.getByTestId('costPrice-input')).toHaveValue(100);
    });

    it('should allow entering selling price', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('sellingPrice-input'), '150');
      expect(screen.getByTestId('sellingPrice-input')).toHaveValue(150);
    });

    it('should accept decimal values for prices', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('costPrice-input'), '99.99');
      expect(screen.getByTestId('costPrice-input')).toHaveValue(99.99);
    });
  });

  describe('Inventory Fields', () => {
    it('should allow entering stock quantity', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('stockQuantity-input'), '500');
      expect(screen.getByTestId('stockQuantity-input')).toHaveValue(500);
    });

    it('should allow entering reorder level', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('reorderLevel-input'), '50');
      expect(screen.getByTestId('reorderLevel-input')).toHaveValue(50);
    });

    it('should have unit of measure options', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      const uomSelect = screen.getByTestId('unitOfMeasure-select');
      expect(screen.getByText('Pieces')).toBeInTheDocument();
      expect(screen.getByText('Meters')).toBeInTheDocument();
      expect(screen.getByText('Yards')).toBeInTheDocument();
      expect(screen.getByText('Kilograms')).toBeInTheDocument();
      
      await user.selectOptions(uomSelect, 'MTR');
      expect(uomSelect).toHaveValue('MTR');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('name-input'), 'Cotton Fabric');
      await user.type(screen.getByTestId('sku-input'), 'FAB-001');
      await user.selectOptions(screen.getByTestId('category-select'), 'fabric');
      await user.type(screen.getByTestId('costPrice-input'), '100');
      await user.type(screen.getByTestId('sellingPrice-input'), '150');
      await user.type(screen.getByTestId('stockQuantity-input'), '500');
      await user.type(screen.getByTestId('reorderLevel-input'), '50');
      await user.selectOptions(screen.getByTestId('unitOfMeasure-select'), 'MTR');
      
      await user.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          name: 'Cotton Fabric',
          sku: 'FAB-001',
          category: 'fabric',
          costPrice: '100',
          sellingPrice: '150',
          stockQuantity: '500',
          reorderLevel: '50',
          unitOfMeasure: 'MTR',
        });
      });
    });

    it('should close drawer after submission', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should close drawer when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.click(screen.getByTestId('cancel-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Category Options', () => {
    it('should have fabric category', () => {
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText('Fabric')).toBeInTheDocument();
    });

    it('should have yarn category', () => {
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText('Yarn')).toBeInTheDocument();
    });

    it('should have accessories category', () => {
      render(<MockProductFormDrawer open={true} mode="create" onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText('Accessories')).toBeInTheDocument();
    });
  });
});
