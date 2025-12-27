import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { useDashboardTimeseries } from '../useDashboardTimeseries';
import { fetchTimeseries } from '../../services/dashboard.service';

vi.mock('../../services/dashboard.service', () => ({
  fetchTimeseries: vi.fn(),
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Dummy({ days }) {
  const { data, isLoading } = useDashboardTimeseries(days);
  return <div>{isLoading ? 'loading' : data?.items?.[0]?.name ?? ''}</div>;
}

test('useDashboardTimeseries calls fetchTimeseries with defaults and returns data', async () => {
  fetchTimeseries.mockResolvedValueOnce({ items: [{ id: 6, name: 'Point 1' }] });

  render(
    <QueryClientProvider client={createQueryClient()}>
      <Dummy />
    </QueryClientProvider>
  );

  await waitFor(() => expect(fetchTimeseries).toHaveBeenCalledWith({ days: 30 }));
  expect(await screen.findByText('Point 1')).toBeInTheDocument();
});
