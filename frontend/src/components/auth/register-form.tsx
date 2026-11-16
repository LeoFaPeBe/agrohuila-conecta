'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { RegisterData, useAuth } from '@/lib/auth-context';
import { Button } from '../ui/button';
import { SelectField, TextField } from '../ui/field';
import { Alert } from '../ui/feedback';

export const HUILA_MUNICIPALITIES = ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'Gigante', 'La Argentina', 'Isnos', 'Suaza', 'Timaná', 'Rivera', 'Palermo'];

type Errors = Partial<Record<keyof RegisterData, string>>;

/** SWR-USR-001: registro como Productor o Comprador. */
export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterData>({ email: '', password: '', fullName: '', role: 'PRODUCER', municipality: '', phone: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: keyof RegisterData) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v: Errors = {};
    if (!form.fullName.trim()) v.fullName = 'El nombre es obligatorio';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) v.email = 'Ingrese un correo válido';
    if (form.password.length < 8) v.password = 'La contraseña debe tener al menos 8 caracteres';
    if (!form.municipality) v.municipality = 'Seleccione su municipio';
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    setServerError('');
    try {
      await register(form);
      onSuccess();
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-gray-700">Tipo de cuenta</legend>
        <div className="grid grid-cols-2 gap-3">
          {(['PRODUCER', 'BUYER'] as const).map((role) => (
            <label key={role} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm ${form.role === role ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-300'}`}>
              <input type="radio" name="role" value={role} checked={form.role === role} onChange={() => setForm({ ...form, role })} className="text-brand-500" />
              {role === 'PRODUCER' ? 'Productor' : 'Comprador'}
            </label>
          ))}
        </div>
      </fieldset>
      <TextField label={form.role === 'PRODUCER' ? 'Nombre o finca' : 'Nombre o negocio'} value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
      <TextField label="Correo electrónico" type="email" value={form.email} onChange={set('email')} error={errors.email} />
      <TextField label="Contraseña" type="password" value={form.password} onChange={set('password')} error={errors.password} hint="Mínimo 8 caracteres" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Municipio" value={form.municipality} onChange={set('municipality')} error={errors.municipality}>
          <option value="">Seleccione…</option>
          {HUILA_MUNICIPALITIES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </SelectField>
        <TextField label="Teléfono (opcional)" value={form.phone} onChange={set('phone')} />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Crear cuenta
      </Button>
      <p className="text-center text-sm text-gray-600">
        ¿Ya tiene cuenta?{' '}
        <Link href="/login" className="font-medium text-brand-500 hover:text-brand-600">
          Inicie sesión
        </Link>
      </p>
    </form>
  );
}
