import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateOrderBody, OrdersService } from './orders.service';

type AuthReq = { user: AuthUser };

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  /** Comprador envía el carrito → uno o varios pedidos Pendientes. */
  @Post()
  @Roles('BUYER')
  create(@Req() req: AuthReq, @Body() body: CreateOrderBody) {
    return this.orders.create(req.user.sub, body);
  }

  @Get('mine')
  @Roles('BUYER')
  mine(@Req() req: AuthReq) {
    return this.orders.mine(req.user.sub);
  }

  @Get('received')
  @Roles('PRODUCER')
  received(@Req() req: AuthReq, @Query('status') status?: string) {
    return this.orders.received(req.user.sub, status);
  }

  /** Productor confirma un pedido → descuenta inventario. */
  @Post(':id/confirm')
  @HttpCode(200)
  @Roles('PRODUCER')
  confirm(@Req() req: AuthReq, @Param('id') id: string) {
    return this.orders.confirm(req.user.sub, id);
  }
}
