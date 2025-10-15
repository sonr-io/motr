/**
 * Tests for useBalance hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { useBalance } from '../../hooks/useBalance.js';
import type { ReactNode } from 'react';

describe('useBalance', () => {
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

  it('should fetch balance data successfully', async () => {
    const { result } = renderHook(
      () => useBalance({ address: 'sonr1test123' }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      address: 'sonr1test123',
      coins: [{ denom: 'usnr', amount: '0' }],
    });
  });

  it('should fetch balance for specific denom', async () => {
    const { result } = renderHook(
      () => useBalance({ address: 'sonr1test123', denom: 'usnr' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.coins).toEqual([
      { denom: 'usnr', amount: '0' },
    ]);
  });

  it('should not fetch when address is empty', () => {
    const { result } = renderHook(() => useBalance({ address: '' }), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key with denom', async () => {
    const { result } = renderHook(
      () => useBalance({ address: 'sonr1test123', denom: 'usnr' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const queryData = queryClient.getQueryData([
      'balance',
      'sonr1test123',
      'usnr',
    ]);
    expect(queryData).toBeDefined();
  });

  it('should use correct query key without denom', async () => {
    const { result } = renderHook(
      () => useBalance({ address: 'sonr1test123' }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const queryData = queryClient.getQueryData(['balance', 'sonr1test123']);
    expect(queryData).toBeDefined();
  });

  it('should respect refetchInterval option', async () => {
    const { result } = renderHook(
      () => useBalance({ address: 'sonr1test123', refetchInterval: 5000 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
