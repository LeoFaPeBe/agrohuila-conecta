import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AppLogger } from '../common/app-logger';
import { PrismaService } from '../prisma/prisma.service';
import { ProductInput, validateProductInput } from './product-rules';
import { buildProductWhere, CatalogQuery, InvalidFilterError, normalizePage, PAGE_SIZE } from './search-filter';

const productSelect = {
  id: true,
  name: true,
  description: true,
  unit: true,
  price: true,
  quantity: true,
  imageUrl: true,
  active: true,
  createdAt: true,
  category: { select: { id: true, name: true } },
  producer: { select: { id: true, fullName: true, municipality: true } },
} as const;

@Injectable()
export class CatalogService {
  private readonly logger = new AppLogger('CatalogService');

  constructor(private readonly prisma: PrismaService) {}

  categories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async municipalities() {
    const rows = await this.prisma.user.findMany({
      where: { role: 'PRODUCER' },
      distinct: ['municipality'],
      select: { municipality: true },
      orderBy: { municipality: 'asc' },
    });
    return rows.map((r) => r.municipality);
  }

  /** SWR-SRCH-006 */
  async search(query: CatalogQuery) {
    let where;
    try {
      where = buildProductWhere(query);
    } catch (e) {
      if (e instanceof InvalidFilterError) throw new BadRequestException(e.message);
      throw e;
    }
    const page = normalizePage(query.page);
    const started = Date.now();
    // DEF-08: consultas en conexiones independientes del pool (sin transacción de solo lectura).
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: productSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.product.count({ where }),
    ]);
    this.logger.info('CATALOG_SEARCH', 'Búsqueda en el catálogo', {
      filters: Object.keys(query).filter((k) => (query as Record<string, unknown>)[k] !== ''),
      results: total,
      durationMs: Date.now() - started,
    });
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, select: productSelect });
    if (!product) throw new NotFoundException('El producto no existe');
    return product;
  }

  mine(producerId: string) {
    return this.prisma.product.findMany({ where: { producerId }, select: productSelect, orderBy: { createdAt: 'desc' } });
  }

  /** SWR-PROD-001 + SWR-PROD-003 */
  async create(producerId: string, input: ProductInput) {
    const errors = validateProductInput(input);
    if (errors.length) throw new BadRequestException(errors);
    await this.ensureCategory(input.categoryId as number);
    const product = await this.prisma.product.create({
      data: {
        name: input.name!.trim(),
        description: input.description!.trim(),
        unit: input.unit!.trim(),
        price: input.price!,
        quantity: input.quantity!,
        imageUrl: input.imageUrl!.trim(),
        categoryId: input.categoryId!,
        producerId,
      },
      select: productSelect,
    });
    this.logger.info('PRODUCT_CREATED', 'Publicación creada', { productId: product.id, producerId });
    return product;
  }

  /** SWR-PROD-006: un productor solo puede modificar sus propias publicaciones. */
  async update(producerId: string, id: string, input: ProductInput & { active?: boolean }) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('El producto no existe');
    if (existing.producerId !== producerId) {
      this.logger.warn('PRODUCT_UPDATE_FORBIDDEN', 'Intento de modificar una publicación ajena', {
        productId: id,
        userId: producerId,
      });
      throw new ForbiddenException('Solo puede modificar sus propias publicaciones');
    }
    const errors = validateProductInput(input, true);
    if (errors.length) throw new BadRequestException(errors);
    if (input.categoryId !== undefined) await this.ensureCategory(input.categoryId);
    const { name, description, unit, price, quantity, imageUrl, categoryId, active } = input;
    const product = await this.prisma.product.update({
      where: { id },
      data: { name, description, unit, price, quantity, imageUrl, categoryId, active },
      select: productSelect,
    });
    this.logger.info('PRODUCT_UPDATED', 'Publicación actualizada', { productId: id, producerId });
    return product;
  }

  private async ensureCategory(categoryId: number) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('La categoría seleccionada no existe');
  }
}
