import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CatalogService } from './catalog.service';
import { ProductInput } from './product-rules';
import { CatalogQuery } from './search-filter';

type AuthReq = { user: AuthUser };

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  categories() {
    return this.catalog.categories();
  }

  @Get('municipalities')
  municipalities() {
    return this.catalog.municipalities();
  }

  /** Catálogo de productos (requiere sesión iniciada). */
  @Get('products')
  @UseGuards(JwtAuthGuard)
  search(@Query() query: CatalogQuery) {
    return this.catalog.search(query);
  }

  @Get('products/mine')
  @UseGuards(JwtAuthGuard)
  @Roles('PRODUCER')
  mine(@Req() req: AuthReq) {
    return this.catalog.mine(req.user.sub);
  }

  @Get('products/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.catalog.findOne(id);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  @Roles('PRODUCER')
  create(@Req() req: AuthReq, @Body() body: ProductInput) {
    return this.catalog.create(req.user.sub, body);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('PRODUCER')
  update(@Req() req: AuthReq, @Param('id') id: string, @Body() body: ProductInput & { active?: boolean }) {
    return this.catalog.update(req.user.sub, id, body);
  }
}
