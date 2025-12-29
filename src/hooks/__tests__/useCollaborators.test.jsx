import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { useCollaborators } from '../useCollaborators';
import { fetchCollaborators } from '../../services/collaborators.service';

vi.mock('../../services/collaborators.service', () => ({
  fetchCollaborators: vi.fn(),
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Dummy() {
  const { data, isLoading } = useCollaborators();
  return <div>{isLoading ? 'loading' : data?.items?.[0]?.name ?? ''}</div>;
}

test('useCollaborators calls fetchCollaborators and returns data', async () => {
  fetchCollaborators.mockResolvedValueOnce({ items: [{ id: 1, name: 'Col A' }] });

  render(
    <QueryClientProvider client={createQueryClient()}>
      <Dummy />
    </QueryClientProvider>
  );

  await waitFor(() => expect(fetchCollaborators).toHaveBeenCalledWith({ q: '', limit: 200 }));
  expect(await screen.findByText('Col A')).toBeInTheDocument();
});
