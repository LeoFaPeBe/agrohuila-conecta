import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from '../common/app-logger';
import { AppRole, ROLES_KEY } from './roles.decorator';

export interface AuthUser {
  sub: string;
  email: string;
  role: AppRole;
  fullName: string;
}

/**
 * Guard de rutas protegidas.
 * 1) Exige un token JWT válido (401 si no existe o expiró).
 * 2) SWR-AUTH-007: autoriza solo si el rol del usuario está incluido en @Roles (403 si no).
 * La autorización se aplica en el servidor (SWR-SEC-003), no solo ocultando botones en la interfaz.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new AppLogger('JwtAuthGuard');

  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Debe iniciar sesión para acceder a este recurso');
    }
    let user: AuthUser;
    try {
      user = this.jwt.verify<AuthUser>(header.slice(7));
    } catch {
      throw new UnauthorizedException('La sesión no es válida o expiró. Inicie sesión nuevamente');
    }
    req.user = user;

    const roles = this.reflector.getAllAndOverride<AppRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles && !roles.includes(user.role)) {
      this.logger.warn('ACCESS_DENIED', 'Rol sin permiso para la operación', {
        userId: user.sub,
        role: user.role,
        path: req.path,
      });
      throw new ForbiddenException('No tiene permisos para realizar esta operación');
    }
    return true;
  }
}
