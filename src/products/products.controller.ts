import { Controller, Delete, Get, Param, Patch, Post, Body, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

import {
	ProductCreateDto,
	ProductDto,
	ProductQueryDto,
	ProductUpdateDto,
} from './dto/product.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller({
	path: 'products',
	version: '1',
})
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@ApiOkResponse({ type: [ProductDto] })
	@Get('/')
	async getAllProducts(@Query() q: ProductQueryDto): Promise<ProductDto[]> {
		const products = await this.productsService.getAll(q);
		const dtos = products.map((p) => ProductDto.fromEntity(p));
		return dtos;
	}

	@ApiOkResponse({ type: ProductDto })
	@Get(':id')
	async getProduct(@Param('id') id: number): Promise<ProductDto> {
		const product = await this.productsService.getById(id);
		return ProductDto.fromEntity(product);
	}

	@ApiCreatedResponse({ type: ProductDto })
	@Post('/')
	async createProduct(@Body() dto: ProductCreateDto): Promise<ProductDto> {
		const product = await this.productsService.createOne(dto);
		return ProductDto.fromEntity(product);
	}

	@ApiOkResponse({ type: ProductDto })
	@Patch(':id')
	async update(
		@Param('id') productId: number,
		@Body() productUpdateDto: ProductUpdateDto,
	): Promise<ProductDto> {
		const updatedProduct = await this.productsService.update(
			productId,
			productUpdateDto,
		);
		return ProductDto.fromEntity(updatedProduct);
	}

	@Delete(':id')
	delete(@Param('id') id: number) {
		return this.productsService.delete(id);
	}
}
