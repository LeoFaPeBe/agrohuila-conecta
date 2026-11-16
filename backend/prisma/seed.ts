/**
 * Datos de demostración para pruebas manuales, Postman y Playwright.
 * Usuarios (contraseña para todos: Prueba123!):
 *   productor1@agrohuila.co (Pitalito) · productor2@agrohuila.co (Garzón) · comprador1@agrohuila.co (Neiva)
 */
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const categories = ['Café', 'Cacao', 'Aguacate', 'Frutas', 'Hortalizas', 'Otros'];
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  const cat = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.name, c.id]));
  const passwordHash = await bcrypt.hash('Prueba123!', 10);

  const users = [
    { email: 'productor1@agrohuila.co', fullName: 'Finca El Mirador', role: 'PRODUCER' as const, municipality: 'Pitalito', phone: '3101112233' },
    { email: 'productor2@agrohuila.co', fullName: 'Asociación Cacaotera de Garzón', role: 'PRODUCER' as const, municipality: 'Garzón', phone: '3112223344' },
    { email: 'comprador1@agrohuila.co', fullName: 'Restaurante Sabor Opita', role: 'BUYER' as const, municipality: 'Neiva', phone: '3123334455' },
  ];
  const ids: Record<string, string> = {};
  for (const u of users) {
    const user = await prisma.user.upsert({ where: { email: u.email }, update: {}, create: { ...u, passwordHash } });
    ids[u.email] = user.id;
  }

  const count = await prisma.product.count();
  if (count === 0) {
    // Imágenes servidas por el frontend (carpeta frontend/public/productos)
    const img = (seed: string) => `/productos/${seed}.svg`;
    await prisma.product.createMany({
      data: [
        { name: 'Café especial pergamino seco', description: 'Café de altura, variedad Castillo, proceso lavado.', unit: 'kg', price: 18000, quantity: 120, imageUrl: img('cafe'), categoryId: cat['Café'], producerId: ids['productor1@agrohuila.co'] },
        { name: 'Aguacate Hass', description: 'Aguacate Hass de exportación, calibre 18-20.', unit: 'kg', price: 7500, quantity: 80, imageUrl: img('aguacate'), categoryId: cat['Aguacate'], producerId: ids['productor1@agrohuila.co'] },
        { name: 'Granadilla', description: 'Granadilla fresca de la zona sur del Huila.', unit: 'kg', price: 6000, quantity: 40, imageUrl: img('granadilla'), categoryId: cat['Frutas'], producerId: ids['productor1@agrohuila.co'] },
        { name: 'Cacao en grano fermentado', description: 'Cacao fino de aroma, fermentado y secado al sol.', unit: 'kg', price: 14000, quantity: 60, imageUrl: img('cacao'), categoryId: cat['Cacao'], producerId: ids['productor2@agrohuila.co'] },
        { name: 'Cholupa', description: 'Fruta típica del Huila, ideal para jugos y postres.', unit: 'kg', price: 9000, quantity: 25, imageUrl: img('cholupa'), categoryId: cat['Frutas'], producerId: ids['productor2@agrohuila.co'] },
        { name: 'Tomate chonto', description: 'Tomate chonto de invernadero.', unit: 'kg', price: 3500, quantity: 4, imageUrl: img('tomate'), categoryId: cat['Hortalizas'], producerId: ids['productor2@agrohuila.co'] },
      ],
    });
  }
  console.log('Seed completado: 6 categorías, 3 usuarios, productos de demostración.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
