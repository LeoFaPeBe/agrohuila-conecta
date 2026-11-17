/**
 * Pruebas de frontend (Vitest + React Testing Library) del formulario de inicio de sesión.
 * SWR-AUTH-001 y SWR-AUTH-002.
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { mockFetchOnce, renderWithProviders } from '@/test/utils';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  test('RTL-01 muestra los mensajes de campos obligatorios si se envía vacío', async () => {
    renderWithProviders(<LoginForm onSuccess={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(screen.getByText(/el correo es obligatorio/i)).toBeVisible();
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeVisible();
  });

  test('RTL-02 credenciales incorrectas muestran un mensaje genérico (SWR-AUTH-002)', async () => {
    const fetchMock = mockFetchOnce(401, { statusCode: 401, message: 'Correo o contraseña incorrectos' });
    const onSuccess = vi.fn();
    renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'comprador1@agrohuila.co');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'ClaveMala1');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
    expect(onSuccess).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.objectContaining({ method: 'POST' }));
  });

  test('RTL-03 inicio de sesión correcto guarda la sesión y llama a onSuccess (SWR-AUTH-001)', async () => {
    mockFetchOnce(200, {
      accessToken: 'token-de-prueba',
      user: { id: 'u1', email: 'productor1@agrohuila.co', fullName: 'Finca El Mirador', role: 'PRODUCER', municipality: 'Pitalito' },
    });
    const onSuccess = vi.fn();
    renderWithProviders(<LoginForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'productor1@agrohuila.co');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Prueba123!');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('agrohuila.token')).toBe('token-de-prueba');
  });

  test('RTL-04 correo con formato inválido no llama al servidor', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderWithProviders(<LoginForm onSuccess={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'correo-sin-arroba');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Prueba123!');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(screen.getByText(/ingrese un correo válido/i)).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
