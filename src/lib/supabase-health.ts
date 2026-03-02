/**
 * Supabase Connection Health Check Utilities
 * Helps detect and handle SSL/connection failures gracefully
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface HealthCheckResult {
  healthy: boolean;
  error?: string;
  errorType?: 'SSL_ERROR' | 'AUTH_ERROR' | 'NETWORK_ERROR' | 'CONFIG_ERROR' | 'UNKNOWN';
  details?: any;
}

/**
 * Check if a response contains HTML error page (like Cloudflare 525 SSL errors)
 */
export function isHTMLError(error: any): boolean {
  if (typeof error === 'string') {
    return error.includes('<!DOCTYPE html>') || error.includes('<html');
  }
  if (error?.message && typeof error.message === 'string') {
    return error.message.includes('<!DOCTYPE html>') || error.message.includes('<html');
  }
  return false;
}

/**
 * Extract error type from HTML error pages
 */
export function parseHTMLError(errorHtml: string): { code: string; message: string } {
  const errorCodeMatch = errorHtml.match(/Error code (\d+)/);
  const errorTitleMatch = errorHtml.match(/<title>.*?\|\s*(\d+):\s*(.*?)<\/title>/);
  
  return {
    code: errorCodeMatch?.[1] || errorTitleMatch?.[1] || 'UNKNOWN',
    message: errorTitleMatch?.[2] || 'Connection error',
  };
}

/**
 * Test Supabase connection health
 */
export async function checkSupabaseHealth(
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<HealthCheckResult> {
  try {
    // Check if credentials are provided
    if (!supabaseUrl || !supabaseKey) {
      return {
        healthy: false,
        errorType: 'CONFIG_ERROR',
        error: 'Missing Supabase credentials. Please check your environment variables.',
      };
    }

    // Verify URL format
    if (!supabaseUrl.includes('supabase.co')) {
      return {
        healthy: false,
        errorType: 'CONFIG_ERROR',
        error: 'Invalid Supabase URL format',
      };
    }

    // Create a test client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('places')
      .select('id')
      .limit(1);

    if (error) {
      // Check if it's an HTML error (SSL/Cloudflare error)
      if (isHTMLError(error)) {
        const htmlError = parseHTMLError(error.message || String(error));
        
        return {
          healthy: false,
          errorType: 'SSL_ERROR',
          error: `Supabase SSL connection failed (Error ${htmlError.code}): ${htmlError.message}. Your Supabase project may be paused or inactive.`,
          details: htmlError,
        };
      }

      // Check for auth errors
      if (error.message?.includes('JWT') || error.message?.includes('unauthorized')) {
        return {
          healthy: false,
          errorType: 'AUTH_ERROR',
          error: 'Invalid Supabase credentials. Check your SUPABASE_SERVICE_ROLE_KEY or ANON_KEY.',
          details: error,
        };
      }

      // Other errors
      return {
        healthy: false,
        errorType: 'UNKNOWN',
        error: error.message || 'Unknown Supabase error',
        details: error,
      };
    }

    return { healthy: true };
  } catch (error: any) {
    // Check if it's an HTML error
    if (isHTMLError(error)) {
      const htmlError = parseHTMLError(error.message || String(error));
      
      return {
        healthy: false,
        errorType: 'SSL_ERROR',
        error: `Connection failed (${htmlError.code}): ${htmlError.message}`,
        details: htmlError,
      };
    }

    return {
      healthy: false,
      errorType: 'NETWORK_ERROR',
      error: error.message || 'Network error connecting to Supabase',
      details: error,
    };
  }
}

/**
 * Wrap Supabase queries with better error handling
 */
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  context: string
): Promise<{ data: T | null; error: string | null; errorType?: string }> {
  try {
    const { data, error } = await queryFn();

    if (error) {
      // Check for HTML errors (SSL failures)
      if (isHTMLError(error)) {
        const htmlError = parseHTMLError(error.message || String(error));
        
        console.error(`[${context}] SSL Error ${htmlError.code}:`, htmlError.message);
        
        return {
          data: null,
          error: `Database connection failed. Your Supabase project may be paused or inactive. Please check your Supabase dashboard.`,
          errorType: 'SSL_ERROR',
        };
      }

      console.error(`[${context}] Supabase Error:`, error);
      
      return {
        data: null,
        error: error.message || 'Database query failed',
        errorType: 'QUERY_ERROR',
      };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error(`[${context}] Unexpected Error:`, error);
    
    return {
      data: null,
      error: error.message || 'Unexpected error',
      errorType: 'UNKNOWN',
    };
  }
}
