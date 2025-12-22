/**
 * Email or Phone Input Component
 * Reusable input that accepts either email or phone number
 * Validates using email regex OR E.164 phone regex
 */

import { forwardRef } from 'react';
import { TextInput } from './globalComponents';
import { cn } from '@/lib/utils';

export interface EmailPhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  disabled?: boolean;
}

export const EmailPhoneInput = forwardRef<HTMLInputElement, EmailPhoneInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        type='text'
        placeholder='Enter your email or phone number'
        className={cn(className)}
        error={error}
        {...props}
      />
    );
  }
);

EmailPhoneInput.displayName = 'EmailPhoneInput';

/**
 * Validation function for email or phone
 * Can be used in form validation
 * Returns specific error messages for email vs phone
 */
export const validateEmailOrPhone = (value: string): { valid: boolean; message?: string } => {
  if (!value) {
    return { valid: false, message: 'Please enter your email or phone number' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  // Check if it looks like an email attempt (contains @)
  if (value.includes('@')) {
    if (emailRegex.test(value)) {
      return { valid: true };
    }
    return {
      valid: false,
      message: 'Please enter a valid email address',
    };
  }

  // Check if it looks like a phone attempt (starts with + or digit)
  if (/^[\+\d]/.test(value)) {
    if (phoneRegex.test(value)) {
      return { valid: true };
    }
    return {
      valid: false,
      message: 'Please enter a valid phone number (with country code, e.g., +1234567890)',
    };
  }

  // Generic error if we can't determine intent
  return {
    valid: false,
    message: 'Please enter a valid email address or phone number',
  };
};

/**
 * Helper to determine if value is email or phone
 */
export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};
