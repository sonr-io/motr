import { useCallback, useState } from 'react';
import type { WebAuthnAuthenticationOptions, WebAuthnRegistrationOptions } from '../types';

/**
 * WebAuthn credential data
 */
export interface WebAuthnCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject?: ArrayBuffer;
    authenticatorData?: ArrayBuffer;
    signature?: ArrayBuffer;
  };
  type: 'public-key';
}

/**
 * Hook for WebAuthn registration and authentication
 *
 * @example
 * ```tsx
 * function WebAuthnRegister() {
 *   const { register, isLoading, error } = useWebAuthn();
 *
 *   const handleRegister = async () => {
 *     try {
 *       const credential = await register({
 *         username: 'user@example.com',
 *         displayName: 'Example User',
 *       });
 *       console.log('Registered:', credential);
 *     } catch (err) {
 *       console.error('Registration failed:', err);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleRegister} disabled={isLoading}>
 *       {isLoading ? 'Registering...' : 'Register with WebAuthn'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useWebAuthn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const register = useCallback(
    async (options: WebAuthnRegistrationOptions): Promise<WebAuthnCredential> => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if WebAuthn is supported
        if (!window.PublicKeyCredential) {
          throw new Error('WebAuthn is not supported in this browser');
        }

        // TODO: Get challenge from server
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const credential = (await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: 'Sonr',
              id: window.location.hostname,
            },
            user: {
              id: new TextEncoder().encode(options.username),
              name: options.username,
              displayName: options.displayName || options.username,
            },
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' }, // ES256
              { alg: -257, type: 'public-key' }, // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              requireResidentKey: true,
              residentKey: 'required',
              userVerification: 'required',
            },
            timeout: options.timeout || 60000,
            attestation: 'direct',
          },
        })) as PublicKeyCredential;

        if (!credential) {
          throw new Error('Failed to create credential');
        }

        return {
          id: credential.id,
          rawId: credential.rawId,
          response: {
            clientDataJSON: (credential.response as AuthenticatorAttestationResponse)
              .clientDataJSON,
            attestationObject: (credential.response as AuthenticatorAttestationResponse)
              .attestationObject,
          },
          type: credential.type as 'public-key',
        };
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const authenticate = useCallback(
    async (options?: WebAuthnAuthenticationOptions): Promise<WebAuthnCredential> => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if WebAuthn is supported
        if (!window.PublicKeyCredential) {
          throw new Error('WebAuthn is not supported in this browser');
        }

        // TODO: Get challenge from server
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const credential = (await navigator.credentials.get({
          publicKey: {
            challenge,
            rpId: window.location.hostname,
            timeout: options?.timeout || 60000,
            userVerification: 'required',
          },
        })) as PublicKeyCredential;

        if (!credential) {
          throw new Error('Failed to get credential');
        }

        return {
          id: credential.id,
          rawId: credential.rawId,
          response: {
            clientDataJSON: (credential.response as AuthenticatorAssertionResponse).clientDataJSON,
            authenticatorData: (credential.response as AuthenticatorAssertionResponse)
              .authenticatorData,
            signature: (credential.response as AuthenticatorAssertionResponse).signature,
          },
          type: credential.type as 'public-key',
        };
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    register,
    authenticate,
    isLoading,
    error,
  };
}
