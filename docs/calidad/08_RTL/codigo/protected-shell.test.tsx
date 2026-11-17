/** Ruta protegida (SWR-AUTH-001): sin sesión redirige al login. */
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { routerMock } from '@/test/setup';
import { renderWithProviders } from '@/test/utils';
import { ProtectedShell } from './protected-shell';

describe('ProtectedShell', () => {
  test('RTL-19 sin sesión no muestra el contenido y redirige a /login', async () => {
    renderWithProviders(
      <ProtectedShell>
        <p>Contenido privado</p>
      </ProtectedShell>,
    );
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/login?next=%2Fdashboard'));
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/verificando sesión/i);
  });

  test('RTL-20 con sesión muestra el menú según el rol (Productor)', async () => {
    localStorage.setItem('agrohuila.token', 't');
    localStorage.setItem('agrohuila.user', JSON.stringify({ id: 'u1', email: 'p@a.co', fullName: 'Finca El Mirador', role: 'PRODUCER', municipality: 'Pitalito' }));
    renderWithProviders(
      <ProtectedShell>
        <p>Contenido privado</p>
      </ProtectedShell>,
    );
    expect(await screen.findByText('Contenido privado')).toBeVisible();
    expect(screen.getByRole('link', { name: /mis productos/i })).toBeVisible();
    expect(screen.queryByRole('link', { name: /^carrito/i })).not.toBeInTheDocument();
  });
});
