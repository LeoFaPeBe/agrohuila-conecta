/**
 * Cliente HTTP del frontend. Todas las operaciones pasan por el backend NestJS
 * (el frontend nunca se conecta directamente a la base de datos).
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export const TOKEN_KEY = 'agrohuila.token';
export const USER_KEY = 'agrohuila.user';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, 'No fue posible conectar con el servidor. Verifique su conexión.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agrohuila:session-expired'));
    }
    throw new ApiError(res.status, (body as { message?: string }).message ?? 'Ocurrió un error inesperado');
  }
  return body as T;
}
