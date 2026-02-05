import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a human-readable error message from various error objects.
 * Handles Axios errors, standard Error objects, and string messages.
 * Maps common technical errors to user-friendly messages.
 */
export function getErrorMessage(error: any): string {
  // 1. Extract the raw message
  let message = 'An unexpected error occurred';

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object') {
    // Axios error handling
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === 'string') message = data;
      else if (data.message) message = data.message;
      else if (data.error) message = data.error;
    } else if (error.message) {
      message = error.message;
    }
  }

  // 2. Clean up and map technical messages to friendly ones

  // Transaction/Database errors
  if (
    message.includes('Transaction already closed') ||
    message.includes('transaction has been expired')
  ) {
    return 'The operation timed out. Please try again.';
  }

  if (message.includes('Unique constraint failed') || message.includes('already exists')) {
    // Try to identify what failed if possible, otherwise generic
    if (message.includes('email')) return 'This email address is already in use.';
    if (message.includes('code')) return 'This code is already in use.';
    return 'A record with this information already exists.';
  }

  if (message.includes('Foreign key constraint failed')) {
    return 'This operation cannot be completed because it references a missing record.';
  }

  if (message.includes('Invalid invocation') || message.includes('PrismaClient')) {
    return 'A system error occurred. Please contact support if this persists.';
  }

  // Auth errors
  if (message.includes('Invalid credentials') || message.includes('Incorrect password')) {
    return 'Invalid email or password.';
  }

  // Network errors
  if (message.includes('Network Error') || message.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // Truncate very long technical messages that fell through
  if (message.length > 200) {
    // If it's a huge dump, just genericize it unless we kept it above
    return 'An error occurred while processing your request.';
  }

  return message;
}
