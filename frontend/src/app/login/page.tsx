'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  return (
    <AuthLayout>
      <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-2xl">Iniciar sesión</h1>
      <p className="mb-8 text-sm text-gray-500">Ingrese su correo y contraseña para acceder a AgroHuila Conecta.</p>
      <LoginForm onSuccess={() => router.replace(next && next.startsWith('/') ? next : '/dashboard')} />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
