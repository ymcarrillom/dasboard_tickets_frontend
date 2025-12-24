import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { useClients } from '../useClients';
import { fetchClients } from '../../services/clients.service';

vi.mock('../../services/clients.service', () => ({
  fetchClients: vi.fn(),
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Dummy({ params }) {
  const { data, isLoading } = useClients(params);
  return <div>{isLoading ? 'loading' : data?.items?.[0]?.name ?? ''}</div>;
}

test('useClients calls fetchClients with params and returns data', async () => {
  fetchClients.mockResolvedValueOnce({ items: [{ id: 1, name: 'Cliente A' }] });

  render(
    <QueryClientProvider client={createQueryClient()}>
      <Dummy params={{ q: 'Alex' }} />
    </QueryClientProvider>
  );

  await waitFor(() => expect(fetchClients).toHaveBeenCalledWith({ limit: 200, q: 'Alex' }));
  expect(await screen.findByText('Cliente A')).toBeInTheDocument();
});
