/**
 * Logger estructurado (Shift Right).
 * Cada evento se escribe como una línea JSON con: timestamp, level, context, event, message, metadata.
 * Regla de privacidad: nunca se registran contraseñas, tokens ni secretos (ver sanitize()).
 */
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const SENSITIVE_KEYS = ['password', 'passwordhash', 'token', 'accesstoken', 'authorization', 'secret', 'jwt'];

export function sanitize(metadata: Record<string, unknown> = {}): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) continue;
    clean[key] = value;
  }
  return clean;
}

/** Enmascara un correo para no exponerlo completo en los logs: productor1@agrohuila.co -> pr***@agrohuila.co */
export function maskEmail(email: string): string {
  const [user, domain] = String(email ?? '').split('@');
  if (!domain) return '***';
  return `${user.slice(0, 2)}***@${domain}`;
}

function bogotaTimestamp(date = new Date()): string {
  // Hora de Colombia (UTC-5, sin horario de verano)
  const local = new Date(date.getTime() - 5 * 60 * 60 * 1000);
  return local.toISOString().replace('Z', '-05:00');
}

export class AppLogger {
  constructor(private readonly context: string) {}

  private write(level: LogLevel, event: string, message: string, metadata?: Record<string, unknown>) {
    const line = JSON.stringify({
      timestamp: bogotaTimestamp(),
      level,
      context: this.context,
      event,
      message,
      metadata: sanitize(metadata),
    });
    if (level === 'ERROR') process.stderr.write(line + '\n');
    else process.stdout.write(line + '\n');
  }

  info(event: string, message: string, metadata?: Record<string, unknown>) {
    this.write('INFO', event, message, metadata);
  }

  warn(event: string, message: string, metadata?: Record<string, unknown>) {
    this.write('WARN', event, message, metadata);
  }

  error(event: string, message: string, metadata?: Record<string, unknown>) {
    this.write('ERROR', event, message, metadata);
  }
}
