import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { useDashboardByCollaborator } from '../useDashboardByCollaborator';
import { fetchByCollaborator } from '../../services/dashboard.service';

vi.mock('../../services/dashboard.service', () => ({
  fetchByCollaborator: vi.fn(),
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Dummy({ days, limit }) {
  const { data, isLoading } = useDashboardByCollaborator(days, limit);
  return <div>{isLoading ? 'loading' : data?.items?.[0]?.name ?? ''}</div>;
}

test('useDashboardByCollaborator calls fetchByCollaborator with defaults and returns data', async () => {
  fetchByCollaborator.mockResolvedValueOnce({ items: [{ id: 3, name: 'Col X' }] });

  render(
    <QueryClientProvider client={createQueryClient()}>
      <Dummy />
    </QueryClientProvider>
  );

  await waitFor(() => expect(fetchByCollaborator).toHaveBeenCalledWith({ days: 30, limit: 10 }));
  expect(await screen.findByText('Col X')).toBeInTheDocument();
});
