import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7: la URL de conexión se define aquí (no en schema.prisma).
// Las migraciones usan DIRECT_URL (conexión directa de Supabase, puerto 5432).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
