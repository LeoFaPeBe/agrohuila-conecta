# AgroHuila Conecta — MVP

Plataforma web que conecta a productores agrícolas del Huila con compradores (tiendas, restaurantes y consumidores).
Proyecto final de **Calidad de Software** · Ingeniería de Sistemas · CORHUILA · 2026.
Autor: Leonardo Fabio Pérez Bermúdez · Docente: César Augusto Pérez Tafur.

| | |
|---|---|
| **Frontend** | Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 (plantilla TailAdmin adaptada) |
| **Backend** | NestJS 10 + Prisma ORM 7 (adaptador `pg`) |
| **Base de datos** | PostgreSQL en Supabase |
| **Autenticación** | Correo + contraseña (bcrypt costo 10) y JWT de 2 horas |
| **Pruebas** | Jest · Vitest + React Testing Library · Postman/Newman · Playwright |

## Módulos y flujo principal

1. **Usuarios y autenticación** — registro (Productor/Comprador), inicio de sesión, rutas protegidas por rol.
2. **Catálogo de productos** — publicar/editar productos, búsqueda con filtros combinados.
3. **Pedidos e inventario** — carrito (un pedido por productor), confirmación y descuento de inventario.

**Flujo principal:** autenticarse → el productor publica → el comprador busca y envía el pedido → el productor confirma → el inventario se descuenta.

## 1. Requisitos previos

- Node.js 22 y npm
- Una cuenta gratuita en [Supabase](https://supabase.com)

## 2. Configurar Supabase

1. En Supabase cree un proyecto nuevo (guarde la contraseña de la base de datos).
2. Vaya a **Project Settings → Database → Connection string** (o el botón **Connect**).
3. Copie dos cadenas:
   - **Transaction pooler** (puerto **6543**) → `DATABASE_URL` (agregue `?pgbouncer=true` al final).
   - **Session pooler / Direct** (puerto **5432**) → `DIRECT_URL` (la usan las migraciones).

## 3. Backend

```bash
cd backend
cp .env.example .env        # edite DATABASE_URL, DIRECT_URL y JWT_SECRET
npm install                 # también ejecuta "prisma generate"
npx prisma migrate deploy   # crea las tablas en Supabase
npm run seed                # categorías, 3 usuarios y 6 productos de demostración
npm run start:dev           # API en http://localhost:4000  (GET /health para verificar)
```

> Para `JWT_SECRET` use una cadena larga y aleatoria, por ejemplo la salida de
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. **Nunca suba el archivo `.env`.**

## 4. Frontend

```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:3000
```

Usuarios de demostración (contraseña `Prueba123!`):

| Correo | Rol | Municipio |
|---|---|---|
| productor1@agrohuila.co | Productor | Pitalito |
| productor2@agrohuila.co | Productor | Garzón |
| comprador1@agrohuila.co | Comprador | Neiva |

## 5. Ejecutar las pruebas

| Prueba | Comando | Resultado esperado |
|---|---|---|
| Unitarias + caja blanca (Jest) | `cd backend && npm run test:cov` | 45 pruebas PASS, cobertura de reglas 100 % |
| Una sola prueba al azar | `cd backend && npx jest -t "UNIT-03"` | 1 PASS |
| Frontend (Vitest + RTL) | `cd frontend && npm run test:cov` | 21 pruebas PASS |
| API (Newman) | `npx newman run docs/calidad/09_Postman/AgroHuila_Conecta.postman_collection.json -e docs/calidad/09_Postman/AgroHuila_Local.postman_environment.json` | 49 aserciones PASS |
| E2E (Playwright) | `cd frontend && npx playwright install chromium && npm run e2e` | 10 ejecuciones PASS |
| Reporte E2E | `cd frontend && npm run e2e:report` | abre el reporte HTML |
| Lint | `npm run lint` (en backend y en frontend) | 0 errores |

Las pruebas Postman y E2E necesitan el backend (con seed) y el frontend en ejecución.
En Postman: **Import** → la colección y el environment de `docs/calidad/09_Postman/` → **Run collection**.

## 6. Estructura del repositorio

```
backend/            API NestJS (src/auth, src/catalog, src/orders, src/common) + prisma/
frontend/           App Next.js (src/app, src/components, src/lib) + e2e/ (Playwright)
docs/
  srs/                          SRS v1.1 (ISO/IEC/IEEE 29148)
  01_Alcance_y_Trazabilidad.xlsx
  05_Matriz_Maestra_Trazabilidad.xlsx
  marca/                        Ficha de marca, logo, paleta, capturas de la plantilla original
  capturas/                     Capturas del MVP final
  calidad/                      Dossier de Calidad y Pruebas (01 a 14)
  Informe_Final_AgroHuila_Conecta.pdf
.github/workflows/ci.yml        CI: lint + pruebas + cobertura (Quality Gate) + build + E2E + Newman
```

## 7. Ramas y CI/CD

- `main`: versiones liberadas (tag `v1.0.0`) · `develop`: integración
- `feature/*`, `fix/*`, `test/*`, `ci/*`: ramas de trabajo que se integran a `develop` con merge (sin fast-forward)
- GitHub Actions ejecuta el pipeline en cada push y pull request; si falla una prueba, el lint o la cobertura baja del umbral, el cambio no se integra.

## Créditos

Interfaz basada en [TailAdmin – Free Next.js Admin Dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard) (licencia MIT).
Desarrollado con apoyo de IA (vibe coding); el alcance, la revisión del código y las pruebas fueron dirigidos por el autor.
