import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** Ruta protegida: devuelve el usuario autenticado. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: unknown }) {
    return req.user;
  }
}
