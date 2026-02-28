/**
 * Waitlist Service
 * Handles waitlist logic and API calls
 */

export interface WaitlistSignupResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface WaitlistErrorResponse {
  success: boolean;
  error: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const waitlist = {
  /**
   * Sign up email for waitlist
   */
  async signup(email: string): Promise<WaitlistSignupResponse | WaitlistErrorResponse> {
    if (!email.trim()) {
      return {
        success: false,
        error: 'Email is required',
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to join waitlist',
        };
      }

      return {
        success: true,
        message: data.message || 'Successfully joined the waitlist!',
        email: data.email,
      };
    } catch (error) {
      console.error('Error signing up for waitlist:', error);
      return {
        success: false,
        error: 'An error occurred. Please try again later.',
      };
    }
  },
};
