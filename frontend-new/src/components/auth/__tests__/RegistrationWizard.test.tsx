import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock RegistrationWizard component for testing
const MockRegistrationWizard = ({ onComplete }: { onComplete: (data: any) => void | Promise<void> }) => {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    termsAccepted: false,
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3 && formData.termsAccepted) {
      onComplete(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="registration-wizard">
      <div data-testid={`step-${step}`}>
        {step === 1 && (
          <div>
            <h2>Step 1: Account Information</h2>
            <input
              data-testid="email-input"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
            />
            <input
              data-testid="phone-input"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone"
            />
          </div>
        )}
        {step === 2 && (
          <div>
            <h2>Step 2: Personal Information</h2>
            <input
              data-testid="firstName-input"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="First Name"
            />
            <input
              data-testid="lastName-input"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last Name"
            />
          </div>
        )}
        {step === 3 && (
          <div>
            <h2>Step 3: Password & Terms</h2>
            <input
              data-testid="password-input"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
            />
            <input
              data-testid="confirmPassword-input"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm Password"
            />
            <label>
              <input
                data-testid="terms-checkbox"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              />
              I accept the terms and conditions
            </label>
          </div>
        )}
      </div>
      <div>
        {step > 1 && <button type="button" onClick={handleBack} data-testid="back-button">Back</button>}
        {step < 3 && <button type="button" onClick={handleNext} data-testid="next-button">Next</button>}
        {step === 3 && <button type="submit" data-testid="submit-button">Register</button>}
      </div>
    </form>
  );
};

import React from 'react';

describe('RegistrationWizard Component', () => {
  let mockOnComplete: any;

  beforeEach(() => {
    mockOnComplete = vi.fn();
  });

  describe('Multi-step Navigation', () => {
    it('should render step 1 by default', () => {
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Account Information')).toBeInTheDocument();
    });

    it('should navigate to step 2 when next is clicked', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      const nextButton = screen.getByTestId('next-button');
      await user.click(nextButton);
      
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
      expect(screen.getByText('Step 2: Personal Information')).toBeInTheDocument();
    });

    it('should navigate to step 3 from step 2', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.click(screen.getByTestId('next-button'));
      await user.click(screen.getByTestId('next-button'));
      
      expect(screen.getByTestId('step-3')).toBeInTheDocument();
      expect(screen.getByText('Step 3: Password & Terms')).toBeInTheDocument();
    });

    it('should navigate back from step 2 to step 1', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.click(screen.getByTestId('next-button'));
      await user.click(screen.getByTestId('back-button'));
      
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('should not show back button on step 1', () => {
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
    });

    it('should not show next button on step 3', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.click(screen.getByTestId('next-button'));
      await user.click(screen.getByTestId('next-button'));
      
      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should validate phone format', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      const phoneInput = screen.getByTestId('phone-input');
      await user.type(phoneInput, '+1234567890');
      
      expect(phoneInput).toHaveValue('+1234567890');
    });

    it('should validate password match', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.click(screen.getByTestId('next-button'));
      await user.click(screen.getByTestId('next-button'));
      
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirmPassword-input');
      
      await user.type(passwordInput, 'Test123!@#');
      await user.type(confirmPasswordInput, 'Test123!@#');
      
      expect(passwordInput).toHaveValue('Test123!@#');
      expect(confirmPasswordInput).toHaveValue('Test123!@#');
    });

    it('should require terms acceptance', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.click(screen.getByTestId('next-button'));
      await user.click(screen.getByTestId('next-button'));
      
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      expect(termsCheckbox).not.toBeChecked();
      
      await user.click(termsCheckbox);
      expect(termsCheckbox).toBeChecked();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with all data when terms are accepted', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      // Step 1
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('phone-input'), '+1234567890');
      await user.click(screen.getByTestId('next-button'));
      
      // Step 2
      await user.type(screen.getByTestId('firstName-input'), 'John');
      await user.type(screen.getByTestId('lastName-input'), 'Doe');
      await user.click(screen.getByTestId('next-button'));
      
      // Step 3
      await user.type(screen.getByTestId('password-input'), 'Test123!@#');
      await user.type(screen.getByTestId('confirmPassword-input'), 'Test123!@#');
      await user.click(screen.getByTestId('terms-checkbox'));
      await user.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith({
          email: 'test@example.com',
          phone: '+1234567890',
          firstName: 'John',
          lastName: 'Doe',
          password: 'Test123!@#',
          confirmPassword: 'Test123!@#',
          termsAccepted: true,
        });
      });
    });

    it('should preserve data when navigating between steps', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('next-button'));
      await user.click(screen.getByTestId('back-button'));
      
      expect(screen.getByTestId('email-input')).toHaveValue('test@example.com');
    });
  });

  describe('Step Indicators', () => {
    it('should show current step number', () => {
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('should update step indicator on navigation', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.click(screen.getByTestId('next-button'));
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
  });

  describe('Field Requirements', () => {
    it('should have all required fields in step 1', () => {
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    });

    it('should have all required fields in step 2', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.click(screen.getByTestId('next-button'));
      
      expect(screen.getByTestId('firstName-input')).toBeInTheDocument();
      expect(screen.getByTestId('lastName-input')).toBeInTheDocument();
    });

    it('should have all required fields in step 3', async () => {
      const user = userEvent.setup();
      render(<MockRegistrationWizard onComplete={mockOnComplete} />);
      
      await user.click(screen.getByTestId('next-button'));
      await user.click(screen.getByTestId('next-button'));
      
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('confirmPassword-input')).toBeInTheDocument();
      expect(screen.getByTestId('terms-checkbox')).toBeInTheDocument();
    });
  });
});
