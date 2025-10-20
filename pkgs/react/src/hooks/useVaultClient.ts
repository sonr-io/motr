import type {
  GetIssuerDIDResponse,
  NewAttenuatedTokenRequest,
  NewOriginTokenRequest,
  SignDataRequest,
  SignDataResponse,
  UCANTokenResponse,
  VerifyDataRequest,
  VerifyDataResponse,
} from '@sonr.io/enclave';
import { useCallback, useState } from 'react';
import { useEnclaveContext } from '../providers/EnclaveProvider';

/**
 * Hook result for vault client operations
 */
export interface UseVaultClientResult {
  isReady: boolean;
  newOriginToken: (request: NewOriginTokenRequest) => Promise<UCANTokenResponse>;
  newAttenuatedToken: (request: NewAttenuatedTokenRequest) => Promise<UCANTokenResponse>;
  signData: (request: SignDataRequest) => Promise<SignDataResponse>;
  verifyData: (request: VerifyDataRequest) => Promise<VerifyDataResponse>;
  getIssuerDID: () => Promise<GetIssuerDIDResponse>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for enclave client operations
 * Provides access to UCAN token creation, data signing, and verification
 *
 * @example
 * ```tsx
 * function TokenManager() {
 *   const { newOriginToken, isLoading } = useEnclaveClient();
 *
 *   const createToken = async () => {
 *     const token = await newOriginToken({
 *       audience_did: 'did:sonr:user123',
 *       expires_at: Date.now() + 3600000, // 1 hour
 *     });
 *     console.log('Token:', token.token);
 *   };
 *
 *   return <button onClick={createToken} disabled={isLoading}>Create Token</button>;
 * }
 * ```
 */
export function useEnclaveClient(): UseVaultClientResult {
  const { client, isReady } = useEnclaveContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const ensureClient = useCallback(() => {
    if (!client || !isReady) {
      throw new Error('Enclave client not initialized');
    }
    return client;
  }, [client, isReady]);

  const newOriginToken = useCallback(
    async (request: NewOriginTokenRequest): Promise<UCANTokenResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const vaultClient = ensureClient();
        return await vaultClient.newOriginToken(request);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [ensureClient]
  );

  const newAttenuatedToken = useCallback(
    async (request: NewAttenuatedTokenRequest): Promise<UCANTokenResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const vaultClient = ensureClient();
        return await vaultClient.newAttenuatedToken(request);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [ensureClient]
  );

  const signData = useCallback(
    async (request: SignDataRequest): Promise<SignDataResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const vaultClient = ensureClient();
        return await vaultClient.signData(request);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [ensureClient]
  );

  const verifyData = useCallback(
    async (request: VerifyDataRequest): Promise<VerifyDataResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const vaultClient = ensureClient();
        return await vaultClient.verifyData(request);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [ensureClient]
  );

  const getIssuerDID = useCallback(async (): Promise<GetIssuerDIDResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const vaultClient = ensureClient();
      return await vaultClient.getIssuerDID();
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [ensureClient]);

  return {
    isReady,
    newOriginToken,
    newAttenuatedToken,
    signData,
    verifyData,
    getIssuerDID,
    isLoading,
    error,
  };
}
