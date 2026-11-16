import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppLogger } from '../common/app-logger';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly logger = new AppLogger('HealthController');

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const started = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up', durationMs: Date.now() - started };
    } catch (e) {
      this.logger.error('DATABASE_UNAVAILABLE', 'No fue posible conectar con la base de datos', {
        error: (e as Error).name,
        durationMs: Date.now() - started,
      });
      throw new ServiceUnavailableException('Servicio no disponible: base de datos sin conexión');
    }
  }
}
