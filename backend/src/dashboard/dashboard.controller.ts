import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

/** Indicadores de la página de inicio del dashboard, según el rol del usuario autenticado. */
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async summary(@Req() req: { user: AuthUser }) {
    const { sub, role } = req.user;
    if (role === 'PRODUCER') {
      const [products, lowStock, pending, confirmed, sales] = await Promise.all([
        this.prisma.product.count({ where: { producerId: sub, active: true } }),
        this.prisma.product.count({ where: { producerId: sub, active: true, quantity: { lte: 5 } } }),
        this.prisma.order.count({ where: { producerId: sub, status: 'PENDING' } }),
        this.prisma.order.count({ where: { producerId: sub, status: 'CONFIRMED' } }),
        this.prisma.order.aggregate({ where: { producerId: sub, status: 'CONFIRMED' }, _sum: { total: true } }),
      ]);
      return { role, products, lowStock, pending, confirmed, salesTotal: sales._sum.total ?? 0 };
    }
    const [pending, confirmed, spent, available] = await Promise.all([
      this.prisma.order.count({ where: { buyerId: sub, status: 'PENDING' } }),
      this.prisma.order.count({ where: { buyerId: sub, status: 'CONFIRMED' } }),
      this.prisma.order.aggregate({ where: { buyerId: sub, status: 'CONFIRMED' }, _sum: { total: true } }),
      this.prisma.product.count({ where: { active: true, quantity: { gt: 0 } } }),
    ]);
    return { role, pending, confirmed, spentTotal: spent._sum.total ?? 0, availableProducts: available };
  }
}
