import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7: la URL de conexión se define aquí (no en schema.prisma).
// Las migraciones usan DIRECT_URL (conexión directa de Supabase, puerto 5432).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  // process.env (y no env()) para que "prisma generate" funcione aunque no exista .env (por ejemplo en el CI).
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
});
