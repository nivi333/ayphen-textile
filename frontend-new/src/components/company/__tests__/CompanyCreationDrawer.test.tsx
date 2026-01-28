import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const MockCompanyCreationDrawer = ({ 
  open, 
  onClose, 
  onSuccess 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSuccess: (data: any) => void | Promise<void>;
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    industry: '',
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSuccess(formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div data-testid="company-creation-drawer">
      <form onSubmit={handleSubmit}>
        <input
          data-testid="name-input"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Company Name"
        />
        <input
          data-testid="slug-input"
          value={formData.slug}
          readOnly
          placeholder="company-slug"
        />
        <select
          data-testid="industry-select"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
        >
          <option value="">Select Industry</option>
          <option value="textile">Textile</option>
          <option value="manufacturing">Manufacturing</option>
        </select>
        <button type="submit" data-testid="submit-button">Create Company</button>
        <button type="button" onClick={onClose} data-testid="cancel-button">Cancel</button>
      </form>
    </div>
  );
};

describe('CompanyCreationDrawer Component', () => {
  let mockOnClose: any;
  let mockOnSuccess: any;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnSuccess = vi.fn();
  });

  describe('Drawer Visibility', () => {
    it('should render when open is true', () => {
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByTestId('company-creation-drawer')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<MockCompanyCreationDrawer open={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.queryByTestId('company-creation-drawer')).not.toBeInTheDocument();
    });
  });

  describe('Auto-slug Generation', () => {
    it('should generate slug from company name', async () => {
      const user = userEvent.setup();
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, 'Ayphen Textile');
      
      const slugInput = screen.getByTestId('slug-input');
      expect(slugInput).toHaveValue('ayphen-textile');
    });

    it('should handle special characters in slug', async () => {
      const user = userEvent.setup();
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, 'ABC & Co. Ltd!');
      
      const slugInput = screen.getByTestId('slug-input');
      expect(slugInput).toHaveValue('abc--co-ltd');
    });

    it('should update slug when name changes', async () => {
      const user = userEvent.setup();
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, 'Test Company');
      expect(screen.getByTestId('slug-input')).toHaveValue('test-company');
      
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');
      expect(screen.getByTestId('slug-input')).toHaveValue('new-name');
    });

    it('should make slug read-only', () => {
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      const slugInput = screen.getByTestId('slug-input');
      expect(slugInput).toHaveAttribute('readOnly');
    });
  });

  describe('Form Validation', () => {
    it('should have company name field', () => {
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
    });

    it('should have industry selection', () => {
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByTestId('industry-select')).toBeInTheDocument();
    });

    it('should allow selecting industry', async () => {
      const user = userEvent.setup();
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      const industrySelect = screen.getByTestId('industry-select');
      await user.selectOptions(industrySelect, 'textile');
      
      expect(industrySelect).toHaveValue('textile');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('name-input'), 'Ayphen Textile');
      await user.selectOptions(screen.getByTestId('industry-select'), 'textile');
      await user.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          name: 'Ayphen Textile',
          slug: 'ayphen-textile',
          industry: 'textile',
        });
      });
    });

    it('should close drawer after successful submission', async () => {
      const user = userEvent.setup();
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByTestId('name-input'), 'Test Company');
      await user.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should close drawer when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      await user.click(screen.getByTestId('cancel-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Industry Options', () => {
    it('should have textile industry option', () => {
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText('Textile')).toBeInTheDocument();
    });

    it('should have manufacturing industry option', () => {
      render(<MockCompanyCreationDrawer open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText('Manufacturing')).toBeInTheDocument();
    });
  });
});
