import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AppLogger, maskEmail } from '../common/app-logger';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

/** Factor de costo de bcrypt (SWR-SEC-002: mínimo 10). */
export const BCRYPT_COST = 10;
/** SWR-AUTH-002: mensaje único que no revela cuál dato es incorrecto. */
export const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos';

@Injectable()
export class AuthService {
  private readonly logger = new AppLogger('AuthService');

  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  /** SWR-USR-001 + SWR-USR-004 */
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      this.logger.warn('REGISTER_REJECTED', 'Correo ya registrado', { email: maskEmail(email) });
      throw new ConflictException('Ya existe una cuenta registrada con este correo electrónico');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName.trim(),
        role: dto.role,
        municipality: dto.municipality.trim(),
        phone: dto.phone,
      },
    });
    this.logger.info('USER_REGISTERED', 'Cuenta creada', { userId: user.id, role: user.role });
    return this.issueToken(user);
  }

  /** SWR-AUTH-001 + SWR-AUTH-002 */
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    const valid = user ? await bcrypt.compare(dto.password, user.passwordHash) : false;
    if (!user || !valid) {
      this.logger.warn('LOGIN_FAILED', 'Intento de inicio de sesión fallido', {
        email: maskEmail(email),
        reason: user ? 'WRONG_PASSWORD' : 'UNKNOWN_EMAIL',
      });
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    this.logger.info('LOGIN_SUCCESS', 'Inicio de sesión correcto', { userId: user.id, role: user.role });
    return this.issueToken(user);
  }

  private issueToken(user: { id: string; email: string; role: 'PRODUCER' | 'BUYER'; fullName: string; municipality: string }) {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email, role: user.role, fullName: user.fullName });
    return {
      accessToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, municipality: user.municipality },
    };
  }
}
