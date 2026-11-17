'use client';

import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  const router = useRouter();
  return (
    <AuthLayout>
      <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-2xl">Crear cuenta</h1>
      <p className="mb-8 text-sm text-gray-500">Regístrese como productor para vender o como comprador para hacer pedidos.</p>
      <RegisterForm onSuccess={() => router.replace('/dashboard')} />
    </AuthLayout>
  );
}
