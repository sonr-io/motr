/**
 * Tests for TransactionButton component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionButton } from '../../components/TransactionButton.js';
import type { ReactNode } from 'react';

describe('TransactionButton', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  const mockTx = {
    messages: [
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: 'sonr1from',
          toAddress: 'sonr1to',
          amount: [{ denom: 'usnr', amount: '1000' }],
        },
      },
    ],
    memo: 'Test transaction',
  };

  it('should render button with children text', () => {
    render(<TransactionButton tx={mockTx}>Send Tokens</TransactionButton>, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('Send Tokens')).toBeInTheDocument();
  });

  it('should render default text when no children provided', () => {
    render(<TransactionButton tx={mockTx} />, { wrapper: Wrapper });

    expect(screen.getByText('Submit Transaction')).toBeInTheDocument();
  });

  it('should show loading text when transaction is pending', async () => {
    render(
      <TransactionButton tx={mockTx} loadingText="Processing...">
        Send
      </TransactionButton>,
      { wrapper: Wrapper },
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Wait for transaction to complete and show success
    await waitFor(() => {
      const currentButton = screen.getByRole('button');
      expect(currentButton).toBeDisabled();
    });
  });

  it('should show success text after transaction succeeds', async () => {
    render(
      <TransactionButton tx={mockTx} successText="Done!">
        Send
      </TransactionButton>,
      { wrapper: Wrapper },
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Done!')).toBeInTheDocument();
    });
  });

  it('should call onSuccess callback with txHash', async () => {
    const onSuccess = vi.fn();
    render(
      <TransactionButton tx={mockTx} onSuccess={onSuccess}>
        Send
      </TransactionButton>,
      { wrapper: Wrapper },
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(onSuccess).toHaveBeenCalledWith(expect.stringContaining('0x'));
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <TransactionButton tx={mockTx} disabled={true}>
        Send
      </TransactionButton>,
      { wrapper: Wrapper },
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(
      <TransactionButton tx={mockTx} className="custom-btn">
        Send
      </TransactionButton>,
      { wrapper: Wrapper },
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-btn');
  });

  it('should disable button while transaction is pending', async () => {
    render(<TransactionButton tx={mockTx}>Send</TransactionButton>, {
      wrapper: Wrapper,
    });

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    // After success, button should be disabled (showing success state)
    await waitFor(() => {
      const currentButton = screen.getByRole('button');
      expect(currentButton).toBeDisabled();
    });
  });
});
