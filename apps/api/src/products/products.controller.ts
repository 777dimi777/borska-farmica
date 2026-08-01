import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductListResponseDto } from './dto/product-response.dto';
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
}
