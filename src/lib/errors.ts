// types/errors.ts - Create a dedicated file for error types

// Define your API error interface
export interface ApiError {
  data?: {
    message?: string | string[];
  };
  status?: number;
}

// Type guard function to check if an unknown error matches your API error structure
export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'data' in error && typeof (error as ApiError).data === 'object' && (error as ApiError).data !== null;
}

// Utility function to extract error message
export function getErrorMessage(error: unknown): string {
  if (isApiError(error) && error.data?.message) {
    const message = error.data.message;
    return Array.isArray(message) ? message.join(', ') : message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

// Helper function to display errors in toast messages
export function handleApiError(error: unknown): string {
  const message = getErrorMessage(error);
  console.error('API Error:', error);
  // Assuming toast is imported where this function is used
  // toast.error(message);
  return message;
}

// Utility function to extract error message from various error formats
// Handles: RTK Query errors, Axios errors, generic errors, and validation error arrays
export function extractErrorMessage(error: unknown, defaultMessage: string = 'An unexpected error occurred'): string {
  // Handle RTK Query error structure: { data: { message: string | string[] } }
  if (typeof error === 'object' && error !== null) {
    const rtkError = error as { data?: { message?: string | string[] } };
    if (rtkError.data?.message) {
      const message = rtkError.data.message;
      return Array.isArray(message) ? message.join(', ') : message;
    }
  }

  // Handle Axios error structure: error.response?.data?.message
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string | string[] } } };
    if (axiosError.response?.data?.message) {
      const message = axiosError.response.data.message;
      return Array.isArray(message) ? message.join(', ') : message;
    }
  }

  // Handle ApiError interface
  if (isApiError(error) && error.data?.message) {
    const message = error.data.message;
    return Array.isArray(message) ? message.join(', ') : message;
  }

  // Handle Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // Handle error with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: string | string[] }).message;
    if (message) {
      return Array.isArray(message) ? message.join(', ') : message;
    }
  }

  return defaultMessage;
}
