import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import ClientsPage from '../ClientsPage';
import { fetchClients } from '../../services/clients.service';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/clients.service', () => ({
  fetchClients: vi.fn(),
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('ClientsPage', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  test('renders initial results and filters after debounce', async () => {
    fetchClients
      .mockResolvedValueOnce({ items: [{ id: 1, name: 'Inicial' }] })
      .mockResolvedValueOnce({ items: [{ id: 2, name: 'Filtrado' }] });

    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ClientsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Initial data
    // debug: log calls count
    // eslint-disable-next-line no-console
    console.log('fetchCalls after render:', fetchClients.mock.calls.length);

    // wait microtasks and log DOM to inspect why it doesn't show the items
    await Promise.resolve();
    // eslint-disable-next-line no-console
    console.log('DOM after microtasks:', document.body.innerHTML);

    await waitFor(() => expect(fetchClients).toHaveBeenCalled());
    expect(await screen.findByText('Inicial')).toBeInTheDocument();

    // Type into search and advance debounce timer
    const input = screen.getByLabelText(/buscar clientes/i);

    vi.useFakeTimers();
    await userEvent.type(input, 'Filtrado');

    // advance debounce (300ms)
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(fetchClients).toHaveBeenCalledWith({ limit: 200, q: 'Filtrado' }));

    expect(await screen.findByText('Filtrado')).toBeInTheDocument();
  });
});
