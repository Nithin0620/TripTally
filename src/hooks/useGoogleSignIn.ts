// ============================================
// Google Sign-In Hook
// Renders the official Google button in popup mode.
// ============================================

import { RefObject, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface UseGoogleSignInOptions {
  clientId: string;
  onSuccess: (token: string) => void;
  onError?: (error: any) => void;
  buttonRef: RefObject<HTMLDivElement>;
  context?: 'signin' | 'signup';
}

export function useGoogleSignIn({ clientId, onSuccess, onError, buttonRef, context = 'signin' }: UseGoogleSignInOptions) {
  const initializedRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const clientIdRef = useRef(clientId);
  const contextRef = useRef(context);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    clientIdRef.current = clientId;
    contextRef.current = context;
  }, [clientId, context, onError, onSuccess]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (typeof window === 'undefined') {
      return;
    }

    if (!clientIdRef.current) {
      onErrorRef.current?.(new Error('Missing Google client ID'));
      return;
    }

    const renderButton = () => {
      if (cancelled || initializedRef.current) return true;

      const google = window.google;
      const container = buttonRef.current;

      if (!google || !google.accounts?.id || !container) {
        return false;
      }

      try {
        google.accounts.id.initialize({
          client_id: clientIdRef.current,
          callback: (response: any) => {
            if (response.credential) {
              onSuccessRef.current(response.credential);
              return;
            }

            onErrorRef.current?.(new Error('No credential in response'));
          },
          auto_select: false,
          ux_mode: 'popup',
          context: contextRef.current,
        });

        container.innerHTML = '';
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: contextRef.current === 'signup' ? 'signup_with' : 'signin_with',
          logo_alignment: 'left',
          width: Math.max(280, Math.min(container.clientWidth || 320, 400)),
        });

        initializedRef.current = true;

        return true;
      } catch (error) {
        onErrorRef.current?.(error);
        return false;
      }
    };

    const tryRender = () => {
      if (renderButton()) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    tryRender();

    if (!initializedRef.current) {
      intervalId = setInterval(tryRender, 100);
    }

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      initializedRef.current = false;
    };
  }, [buttonRef]);
}

