import { NextFunction, Request, Response } from 'express';
import { AppLogger } from './app-logger';

const logger = new AppLogger('HttpRequest');

/** Registra método, ruta, código de estado y duración de cada solicitud (sin cuerpo ni cabeceras). */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();
  res.on('finish', () => {
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('HTTP_REQUEST', `${req.method} ${req.path}`, {
      status: res.statusCode,
      durationMs: Date.now() - started,
    });
  });
  next();
}
