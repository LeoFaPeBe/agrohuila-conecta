/**
 * Pruebas unitarias de AuthService con dependencias simuladas (mock de Prisma y JWT).
 * SWR-AUTH-001, SWR-AUTH-002, SWR-USR-004, SWR-SEC-002.
 */
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService, INVALID_CREDENTIALS } from './auth.service';

jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

function setup(user: unknown = null) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'new-id', ...data })),
    },
  };
  const jwt = { sign: jest.fn().mockReturnValue('signed-token') };
  return { service: new AuthService(prisma as never, jwt as never), prisma, jwt };
}

describe('AuthService', () => {
  test('UNIT-11 login correcto devuelve token y datos públicos del usuario (SWR-AUTH-001)', async () => {
    const passwordHash = await bcrypt.hash('Prueba123!', 4);
    const { service } = setup({ id: 'u1', email: 'a@b.co', passwordHash, role: 'BUYER', fullName: 'A', municipality: 'Neiva' });
    const res = await service.login({ email: 'A@B.CO ', password: 'Prueba123!' });
    expect(res.accessToken).toBe('signed-token');
    expect(res.user).not.toHaveProperty('passwordHash');
  });

  test('UNIT-12 contraseña incorrecta y correo inexistente dan el MISMO mensaje (SWR-AUTH-002)', async () => {
    const passwordHash = await bcrypt.hash('Prueba123!', 4);
    const existing = setup({ id: 'u1', email: 'a@b.co', passwordHash, role: 'BUYER', fullName: 'A', municipality: 'Neiva' });
    const unknown = setup(null);
    await expect(existing.service.login({ email: 'a@b.co', password: 'mala' })).rejects.toThrow(INVALID_CREDENTIALS);
    await expect(unknown.service.login({ email: 'x@b.co', password: 'mala' })).rejects.toThrow(INVALID_CREDENTIALS);
    await expect(unknown.service.login({ email: 'x@b.co', password: 'mala' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  test('UNIT-13 registro con correo existente se rechaza (SWR-USR-004)', async () => {
    const { service } = setup({ id: 'u1' });
    await expect(
      service.register({ email: 'a@b.co', password: 'Prueba123!', fullName: 'A', role: 'BUYER', municipality: 'Neiva' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  test('UNIT-14 el registro guarda la contraseña con hash bcrypt, nunca en texto plano (SWR-SEC-002)', async () => {
    const { service, prisma } = setup(null);
    await service.register({ email: 'Nuevo@B.co', password: 'Prueba123!', fullName: ' Ana ', role: 'PRODUCER', municipality: 'Garzón' });
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.passwordHash).not.toBe('Prueba123!');
    expect(data.passwordHash).toMatch(/^\$2[aby]\$10\$/);
    expect(data.email).toBe('nuevo@b.co');
    expect(data.fullName).toBe('Ana');
  });
});
