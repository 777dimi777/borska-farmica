import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductDetailResponseDto } from './dto/product-detail-response.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductListResponseDto } from './dto/product-response.dto';
import { ProductSlugDto } from './dto/product-slug.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  @ApiOperation({ summary: 'List public products' })
  @ApiOkResponse({ type: ProductListResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  findAll(@Query() query: ProductQueryDto): Promise<ProductListResponseDto> {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get public product details by canonical slug' })
  @ApiOkResponse({ type: ProductDetailResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid slug.' })
  @ApiNotFoundResponse({ description: 'Public product not found.' })
  findBySlug(
    @Param() params: ProductSlugDto,
  ): Promise<ProductDetailResponseDto> {
    return this.productsService.findBySlug(params.slug);
  }
}
