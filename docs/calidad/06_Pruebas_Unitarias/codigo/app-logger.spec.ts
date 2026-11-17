/** Pruebas unitarias de la privacidad de los logs (Shift Right / SWR-SEC). */
import { AppLogger, maskEmail, sanitize } from './app-logger';

describe('Privacidad de logs', () => {
  test('UNIT-09 sanitize elimina contraseñas y tokens de la metadata', () => {
    const clean = sanitize({ userId: 'u1', password: '123', accessToken: 'abc', Authorization: 'Bearer x' });
    expect(clean).toEqual({ userId: 'u1' });
  });

  test('UNIT-10 maskEmail oculta el usuario del correo', () => {
    expect(maskEmail('productor1@agrohuila.co')).toBe('pr***@agrohuila.co');
    expect(maskEmail('sin-arroba')).toBe('***');
  });

  test('el logger escribe una línea JSON con los campos requeridos', () => {
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    new AppLogger('TestContext').info('TEST_EVENT', 'mensaje', { password: 'no', orderId: 'o1' });
    const line = JSON.parse(String(spy.mock.calls[0][0]));
    expect(line).toEqual(
      expect.objectContaining({ level: 'INFO', context: 'TestContext', event: 'TEST_EVENT', metadata: { orderId: 'o1' } }),
    );
    expect(line.timestamp).toMatch(/-05:00$/);
    spy.mockRestore();
  });

  test('ERROR y WARN usan el canal correcto', () => {
    const err = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const out = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const logger = new AppLogger('X');
    logger.error('E', 'e');
    logger.warn('W', 'w');
    expect(err).toHaveBeenCalledTimes(1);
    expect(out).toHaveBeenCalledTimes(1);
    err.mockRestore();
    out.mockRestore();
  });
});
