/**
 * Utility functions for response formatting and error handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const successResponse = <T = any>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
  };
};

export const errorResponse = (error: string, status?: number): ApiResponse => {
  return {
    success: false,
    error,
  };
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if date range is valid
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end && !isNaN(start.getTime()) && !isNaN(end.getTime());
};

/**
 * Sanitize user input (prevent injection)
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Format error message for client
 */
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error?.message) {
    return error.error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Parse and validate limit/offset for pagination
 */
export const getPaginationParams = (
  limit?: string | number,
  offset?: string | number
): { limit: number; offset: number } => {
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  let parsedLimit = parseInt(String(limit || DEFAULT_LIMIT), 10);
  let parsedOffset = parseInt(String(offset || 0), 10);

  // Validate limits
  if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = DEFAULT_LIMIT;
  if (parsedLimit > MAX_LIMIT) parsedLimit = MAX_LIMIT;
  if (isNaN(parsedOffset) || parsedOffset < 0) parsedOffset = 0;

  return { limit: parsedLimit, offset: parsedOffset };
};
