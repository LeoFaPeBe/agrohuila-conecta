import { SetMetadata } from '@nestjs/common';

export type AppRole = 'PRODUCER' | 'BUYER';
export const ROLES_KEY = 'roles';
/** SWR-AUTH-007: declara qué roles pueden ejecutar una operación protegida. */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
