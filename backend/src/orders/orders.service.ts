import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppLogger } from '../common/app-logger';
import { PrismaService } from '../prisma/prisma.service';
import {
  calculateOrderTotal,
  CartLine,
  evaluateConfirmation,
  groupCartByProducer,
  validateItemQuantity,
  validateOrderTotal,
} from './order-rules';

export interface CreateOrderBody {
  items?: { productId: string; quantity: number }[];
}

const orderInclude = {
  items: { include: { product: { select: { id: true, name: true, unit: true, quantity: true } } } },
  buyer: { select: { id: true, fullName: true, municipality: true } },
  producer: { select: { id: true, fullName: true, municipality: true } },
} as const;

@Injectable()
export class OrdersService {
  private readonly logger = new AppLogger('OrdersService');

  constructor(private readonly prisma: PrismaService) {}

  /** SWR-ORD-002, SWR-ORD-003, SWR-ORD-004 */
  async create(buyerId: string, body: CreateOrderBody) {
    const started = Date.now();
    const items = body?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('El pedido debe tener al menos un producto');
    }
    const ids = [...new Set(items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({ where: { id: { in: ids }, active: true } });

    const lines: CartLine[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new BadRequestException('Uno de los productos no existe o no está disponible');
      const totalRequested = items.filter((i) => i.productId === item.productId).reduce((s, i) => s + Number(i.quantity), 0);
      const check = validateItemQuantity(Number(item.quantity), product.quantity);
      const checkTotal = validateItemQuantity(totalRequested, product.quantity);
      const failed = !check.ok ? check : !checkTotal.ok ? checkTotal : null;
      if (failed && !failed.ok) {
        throw new BadRequestException(`${product.name}: ${failed.message}`);
      }
      lines.push({ productId: product.id, producerId: product.producerId, quantity: Number(item.quantity), unitPrice: product.price });
    }

    const groups = groupCartByProducer(lines);
    for (const group of groups.values()) {
      const check = validateOrderTotal(calculateOrderTotal(group));
      if (!check.ok) throw new BadRequestException(check.message);
    }
    // DEF-08: transacción interactiva con consultas secuenciales (el driver pg no admite
    // consultas simultáneas sobre la misma conexión dentro de una transacción).
    const createdIds = await this.prisma.$transaction(async (tx) => {
      const ids: string[] = [];
      for (const [producerId, group] of groups.entries()) {
        const order = await tx.order.create({
          data: { buyerId, producerId, status: 'PENDING', total: calculateOrderTotal(group) },
        });
        await tx.orderItem.createMany({
          data: group.map((l) => ({ orderId: order.id, productId: l.productId, quantity: l.quantity, unitPrice: l.unitPrice })),
        });
        ids.push(order.id);
      }
      return ids;
    });
    const orders = await this.prisma.order.findMany({
      where: { id: { in: createdIds } },
      include: orderInclude,
      orderBy: { number: 'asc' },
    });
    for (const order of orders) {
      this.logger.info('ORDER_CREATED', 'Pedido creado en estado Pendiente', {
        orderId: order.id,
        orderNumber: order.number,
        buyerId,
        producerId: order.producerId,
        items: order.items.length,
        total: order.total,
      });
    }
    this.logger.info('CART_SUBMITTED', 'Carrito enviado', {
      buyerId,
      ordersCreated: orders.length,
      durationMs: Date.now() - started,
    });
    return orders;
  }

  mine(buyerId: string) {
    return this.prisma.order.findMany({ where: { buyerId }, include: orderInclude, orderBy: { createdAt: 'desc' } });
  }

  received(producerId: string, status?: string) {
    const filter = status === 'PENDING' || status === 'CONFIRMED' ? { status: status as 'PENDING' | 'CONFIRMED' } : {};
    return this.prisma.order.findMany({
      where: { producerId, ...filter },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** SWR-ORD-006 + SWR-INV-002 + SWR-INV-003 */
  async confirm(producerId: string, orderId: string) {
    const started = Date.now();
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
      if (!order) throw new NotFoundException('El pedido no existe');

      const decision = evaluateConfirmation(
        {
          status: order.status,
          producerId: order.producerId,
          items: order.items.map((i) => ({ productName: i.product.name, quantity: i.quantity, available: i.product.quantity })),
        },
        producerId,
      );
      if (!decision.ok) {
        this.logger.warn('ORDER_CONFIRM_REJECTED', 'Confirmación de pedido rechazada', {
          orderId,
          userId: producerId,
          code: decision.code,
        });
        if (decision.code === 'NOT_OWNER') throw new ForbiddenException(decision.message);
        throw new ConflictException(decision.message);
      }

      // SWR-INV-002: descuenta el inventario. La condición "quantity >= pedido" evita inventario negativo
      // si dos confirmaciones concurrentes compiten por el mismo producto (SWR-REL-001).
      for (const item of order.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new ConflictException(`No hay cantidad suficiente de ${item.product.name}`);
        }
      }
      // Solo cambia el estado si el pedido sigue Pendiente (evita doble confirmación).
      const changed = await tx.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: { status: 'CONFIRMED', confirmedAt: new Date() },
      });
      if (changed.count === 0) throw new ConflictException('Solo se pueden confirmar pedidos en estado Pendiente');
      return tx.order.findUnique({ where: { id: orderId }, include: orderInclude });
    });

    this.logger.info('ORDER_CONFIRMED', 'Pedido confirmado e inventario descontado', {
      orderId,
      orderNumber: result?.number,
      producerId,
      durationMs: Date.now() - started,
    });
    return result;
  }
}
