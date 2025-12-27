import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { useDashboardByType } from '../useDashboardByType';
import { fetchByType } from '../../services/dashboard.service';

vi.mock('../../services/dashboard.service', () => ({
  fetchByType: vi.fn(),
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Dummy({ days }) {
  const { data, isLoading } = useDashboardByType(days);
  return <div>{isLoading ? 'loading' : data?.items?.[0]?.name ?? ''}</div>;
}

test('useDashboardByType calls fetchByType with defaults and returns data', async () => {
  fetchByType.mockResolvedValueOnce({ items: [{ id: 5, name: 'Type A' }] });

  render(
    <QueryClientProvider client={createQueryClient()}>
      <Dummy />
    </QueryClientProvider>
  );

  await waitFor(() => expect(fetchByType).toHaveBeenCalledWith({ days: 30 }));
  expect(await screen.findByText('Type A')).toBeInTheDocument();
});
