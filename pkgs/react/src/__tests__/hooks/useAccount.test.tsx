/**
 * Tests for useAccount hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAccount } from '../../hooks/useAccount.js';
import type { ReactNode } from 'react';

describe('useAccount', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch account data successfully', async () => {
    const { result } = renderHook(
      () => useAccount({ address: 'sonr1test123' }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      address: 'sonr1test123',
      accountNumber: '0',
      sequence: '0',
    });
  });

  it('should not fetch when address is empty', () => {
    const { result } = renderHook(() => useAccount({ address: '' }), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should respect enabled option', () => {
    const { result } = renderHook(
      () => useAccount({ address: 'sonr1test123', enabled: false }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key', async () => {
    const { result } = renderHook(
      () => useAccount({ address: 'sonr1test123' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const queryData = queryClient.getQueryData(['account', 'sonr1test123']);
    expect(queryData).toBeDefined();
  });

  it('should respect staleTime option', async () => {
    const { result } = renderHook(
      () => useAccount({ address: 'sonr1test123', staleTime: 60000 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const queryState = queryClient.getQueryState(['account', 'sonr1test123']);
    expect(queryState?.dataUpdatedAt).toBeDefined();
  });
});
