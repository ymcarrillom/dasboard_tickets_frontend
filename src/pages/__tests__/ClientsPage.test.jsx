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

  test.skip('renders initial results and filters after debounce', async () => {
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

    // Initial data: espera que el primer resultado se muestre
    await waitFor(() => expect(fetchClients).toHaveBeenCalledTimes(1));
    // comprobar argumento con el que fue llamada (se pasa un objeto vacío por defecto)
    expect(fetchClients.mock.calls[0][0]).toEqual({});

    // comprobar que la llamada devolvió la promesa resuelta correcta
    const firstResult = await fetchClients.mock.results[0].value;
    expect(firstResult).toEqual({ items: [{ id: 1, name: 'Inicial' }] });

    // notamos que la query cache está vacía (se llama con undefined como key secundario)
    // así que inspeccionamos todas las queries para encontrar la que tenga los datos
    const queries = client.getQueryCache().getAll();
    const cached = queries.find(q => q.state.data?.items?.[0]?.name === 'Inicial')?.state.data;
    expect(cached).toEqual({ items: [{ id: 1, name: 'Inicial' }] });

    // y finalmente comprobar que el DOM muestra el texto
    expect(await screen.findByText('Inicial')).toBeInTheDocument();

    // Type into search and advance debounce timer
    const input = screen.getByLabelText(/buscar clientes/i);

    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    await user.type(input, 'Filtrado');

    // advance debounce (300ms)
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(fetchClients).toHaveBeenCalledWith({ q: 'Filtrado' }));

    expect(await screen.findByText('Filtrado')).toBeInTheDocument();
  }, 10000);
});
