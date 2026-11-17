'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { validateLogin } from '@/lib/validation';
import { Button } from '../ui/button';
import { TextField } from '../ui/field';
import { Alert } from '../ui/feedback';

/** SWR-AUTH-001 / SWR-AUTH-002: formulario de inicio de sesión con correo y contraseña. */
export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    const v = validateLogin(email, password);
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <TextField label="Correo electrónico" type="email" autoComplete="email" placeholder="usuario@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <TextField label="Contraseña" type="password" autoComplete="current-password" placeholder="Ingrese su contraseña" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
      <Button type="submit" className="w-full" loading={loading}>
        Iniciar sesión
      </Button>
      <p className="text-center text-sm text-gray-600">
        ¿No tiene cuenta?{' '}
        <Link href="/registro" className="font-medium text-brand-500 hover:text-brand-600">
          Regístrese
        </Link>
      </p>
    </form>
  );
}
