/**
 * Tests for AccountInfo component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { AccountInfo } from '../../components/AccountInfo.js';
import type { ReactNode } from 'react';

describe('AccountInfo', () => {
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

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  it('should render loading state', () => {
    render(<AccountInfo address="sonr1test123" showLoading={true} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText(/loading account information/i)).toBeInTheDocument();
  });

  it('should render account data', async () => {
    render(<AccountInfo address="sonr1test123" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/sonr1test123/)).toBeInTheDocument();
    });

    expect(screen.getByText(/address:/i)).toBeInTheDocument();
  });

  it('should not show loading when showLoading is false', () => {
    render(<AccountInfo address="sonr1test123" showLoading={false} />, {
      wrapper: Wrapper,
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('should apply custom className', async () => {
    const { container } = render(
      <AccountInfo address="sonr1test123" className="custom-class" />,
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });
  });

  it('should render account number when available', async () => {
    render(<AccountInfo address="sonr1test123" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/account number:/i)).toBeInTheDocument();
    });
  });

  it('should render sequence when available', async () => {
    render(<AccountInfo address="sonr1test123" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/sequence:/i)).toBeInTheDocument();
    });
  });
});
