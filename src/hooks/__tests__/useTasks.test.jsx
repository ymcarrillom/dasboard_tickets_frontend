import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { useTasks } from '../useTasks';
import { api } from '../../services/api';

vi.mock('../../services/api', () => ({
  api: { get: vi.fn() },
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Dummy({ params }) {
  const { data, isLoading } = useTasks(params);
  return <div>{isLoading ? 'loading' : data?.items?.[0]?.title ?? ''}</div>;
}

test('useTasks calls api.get with /tasks and params and returns data', async () => {
  api.get.mockResolvedValueOnce({ data: { items: [{ id: 10, title: 'Tarea X' }] } });

  render(
    <QueryClientProvider client={createQueryClient()}>
      <Dummy params={{ status: 'pending' }} />
    </QueryClientProvider>
  );

  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/tasks', { params: { status: 'pending' } }));
  expect(await screen.findByText('Tarea X')).toBeInTheDocument();
});
