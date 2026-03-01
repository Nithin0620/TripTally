// ============================================
// Google Sign-In Hook
// ============================================

import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface UseGoogleSignInOptions {
  clientId: string;
  onSuccess: (token: string) => void;
  onError?: (error: any) => void;
}

export function useGoogleSignIn({ clientId, onSuccess, onError }: UseGoogleSignInOptions) {
  useEffect(() => {
    if (!window.google) {
      console.error('Google Sign-In library not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        console.log('Google Sign-In response:', response);
        if (response.credential) {
          onSuccess(response.credential);
        } else {
          if (onError) {
            onError(new Error('No credential in response'));
          }
        }
      },
    });
  }, [clientId, onSuccess, onError]);
}

