/**
 * React hook for WebAuthn passkey authentication
 * @module hooks/useWebAuthn
 */

import { useState, useCallback } from 'react';

/**
 * WebAuthn credential data
 */
export interface WebAuthnCredential {
  /** Credential ID */
  id: string;
  /** Raw credential ID */
  rawId: ArrayBuffer;
  /** Credential type */
  type: 'public-key';
  /** Authenticator response */
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject?: ArrayBuffer;
    authenticatorData?: ArrayBuffer;
    signature?: ArrayBuffer;
  };
}

/**
 * WebAuthn registration options
 */
export interface RegisterOptions {
  /** Username for registration */
  username: string;
  /** Display name */
  displayName?: string;
  /** Relying party name */
  rpName?: string;
}

/**
 * WebAuthn login options
 */
export interface LoginOptions {
  /** Allow any registered credential */
  allowCredentials?: string[];
}

/**
 * Result of useWebAuthn hook
 */
export interface UseWebAuthnResult {
  /** Register new passkey */
  register: (options: RegisterOptions) => Promise<WebAuthnCredential>;
  /** Login with passkey */
  login: (options?: LoginOptions) => Promise<WebAuthnCredential>;
  /** Check if WebAuthn is supported */
  isSupported: boolean;
  /** Is operation in progress */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Registers new WebAuthn credential (placeholder)
 */
async function registerPasskey(
  _options: RegisterOptions,
): Promise<WebAuthnCredential> {
  // Placeholder implementation - will use @sonr.io/browser WebAuthn utilities
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const credentialId = Math.random().toString(36).substring(2, 15);
  return {
    id: credentialId,
    rawId: new ArrayBuffer(16),
    type: 'public-key',
    response: {
      clientDataJSON: new ArrayBuffer(32),
      attestationObject: new ArrayBuffer(64),
    },
  };
}

/**
 * Authenticates with WebAuthn credential (placeholder)
 */
async function loginPasskey(
  _options?: LoginOptions,
): Promise<WebAuthnCredential> {
  // Placeholder implementation - will use @sonr.io/browser WebAuthn utilities
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const credentialId = Math.random().toString(36).substring(2, 15);
  return {
    id: credentialId,
    rawId: new ArrayBuffer(16),
    type: 'public-key',
    response: {
      clientDataJSON: new ArrayBuffer(32),
      authenticatorData: new ArrayBuffer(64),
      signature: new ArrayBuffer(64),
    },
  };
}

/**
 * React hook for WebAuthn passkey registration and authentication
 *
 * Provides methods to register and login with passkeys (biometric auth).
 *
 * @example
 * ```tsx
 * function PasskeyAuth() {
 *   const { register, login, isSupported, isLoading, error } = useWebAuthn();
 *
 *   if (!isSupported) {
 *     return <p>WebAuthn is not supported in this browser</p>;
 *   }
 *
 *   const handleRegister = async () => {
 *     try {
 *       const credential = await register({
 *         username: 'user@example.com',
 *         displayName: 'John Doe',
 *       });
 *       console.log('Registered:', credential.id);
 *     } catch (err) {
 *       console.error('Registration failed:', err);
 *     }
 *   };
 *
 *   const handleLogin = async () => {
 *     try {
 *       const credential = await login();
 *       console.log('Logged in:', credential.id);
 *     } catch (err) {
 *       console.error('Login failed:', err);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleRegister} disabled={isLoading}>
 *         Register Passkey
 *       </button>
 *       <button onClick={handleLogin} disabled={isLoading}>
 *         Login with Passkey
 *       </button>
 *       {error && <p className="error">{error}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebAuthn(): UseWebAuthnResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if WebAuthn is supported
  const isSupported =
    typeof window !== 'undefined' &&
    'credentials' in navigator &&
    'create' in navigator.credentials;

  const register = useCallback(async (options: RegisterOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const credential = await registerPasskey(options);
      setIsLoading(false);
      return credential;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to register passkey';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const login = useCallback(async (options?: LoginOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const credential = await loginPasskey(options);
      setIsLoading(false);
      return credential;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to login with passkey';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    register,
    login,
    isSupported,
    isLoading,
    error,
  };
}
