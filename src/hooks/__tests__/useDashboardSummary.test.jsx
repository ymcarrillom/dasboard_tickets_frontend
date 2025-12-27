import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { useDashboardSummary } from '../useDashboardSummary';
import { fetchSummary } from '../../services/dashboard.service';

vi.mock('../../services/dashboard.service', () => ({
  fetchSummary: vi.fn(),
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Dummy() {
  const { data, isLoading } = useDashboardSummary();
  return <div>{isLoading ? 'loading' : data?.total ?? ''}</div>;
}

test('useDashboardSummary calls fetchSummary and returns data', async () => {
  fetchSummary.mockResolvedValueOnce({ total: 99 });

  render(
    <QueryClientProvider client={createQueryClient()}>
      <Dummy />
    </QueryClientProvider>
  );

  await waitFor(() => expect(fetchSummary).toHaveBeenCalled());
  expect(await screen.findByText('99')).toBeInTheDocument();
});
