import {
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Body,
	Query,
	ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';

import {
	ProductCreateDto,
	ProductDto,
	ProductImportDto,
	ProductQueryDto,
	ProductUpdateDto,
} from './dto/product.dto';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { PaginatedDto } from './../shared/pagination/dto/index';
import { PaginationParamsDto } from 'src/shared/pagination/dto';
import { ApiPaginatedResponse } from 'src/shared/pagination/decorators';

@ApiTags('Products')
@Controller({
	path: 'products',
	version: '1',
})
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Public()
	@ApiPaginatedResponse(ProductDto)
	@Get('/')
	async getAllProducts(
		@Query() q: ProductQueryDto,
		@Query() dto: PaginationParamsDto,
	): Promise<PaginatedDto<ProductDto>> {
		const products = await this.productsService.getAll(q, dto);
		return products;
	}

	@Public()
	@ApiOkResponse({ type: ProductDto })
	@Get(':slug')
	async getProduct(@Param('slug') slug: string): Promise<ProductDto> {
		const product = await this.productsService.getBySlug(slug);
		return product;
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: ProductDto })
	@Post('/')
	async createProduct(@Body() dto: ProductCreateDto): Promise<ProductDto> {
		const product = await this.productsService.createOne(dto);
		return product;
	}

	@ApiBearerAuth()
	@ApiOkResponse({ type: ProductDto })
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) productId: number,
		@Body() productUpdateDto: ProductUpdateDto,
	): Promise<ProductDto> {
		const updatedProduct = await this.productsService.update(
			productId,
			productUpdateDto,
		);
		return updatedProduct;
	}

	@ApiBearerAuth()
	@Delete(':id')
	async delete(@Param('id', ParseIntPipe) id: number): Promise<ProductDto> {
		return await this.productsService.delete(id);
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: [ProductDto] })
	@Post('/import')
	async importProduct(@Body() dto: ProductImportDto) {
		const createdProducts: ProductDto[] =
			await this.productsService.importFromFile(dto);
		return createdProducts;
	}
}
