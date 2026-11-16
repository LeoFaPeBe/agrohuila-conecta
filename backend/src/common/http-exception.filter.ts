import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from './app-logger';

/**
 * Filtro global de excepciones.
 * - Errores 4xx: se responden con un mensaje claro en español (WARN en el log para validaciones).
 * - Errores no controlados: se responde 500 genérico y se registra ERROR con contexto útil (sin datos sensibles).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse() as string | { message?: string | string[] };
      const raw = typeof body === 'string' ? body : body.message;
      const message = Array.isArray(raw) ? raw.join('. ') : raw ?? exception.message;
      if (status === HttpStatus.BAD_REQUEST) {
        this.logger.warn('VALIDATION_REJECTED', 'Solicitud rechazada por validación', {
          method: req.method,
          path: req.path,
          reason: message,
        });
      }
      return res.status(status).json({ statusCode: status, message });
    }

    const err = exception as Error;
    this.logger.error('UNHANDLED_ERROR', 'Error no controlado', {
      method: req.method,
      path: req.path,
      error: err?.name,
      detail: err?.message?.slice(0, 300),
    });
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ statusCode: 500, message: 'Ocurrió un error inesperado. Intente de nuevo más tarde.' });
  }
}
