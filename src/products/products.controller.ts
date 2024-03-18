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
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ImportTemplate, ProductFullData } from './types';

@ApiTags('Products')
@Controller({
	path: 'products',
	version: '1',
})
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@ApiOkResponse({ type: [ProductDto] })
	@Get('/')
	async getAllProducts(@Query() q: ProductQueryDto) {
		const products: ProductDto[] = await this.productsService.getAll(q);
		return products;
	}

	@ApiOkResponse({ type: ProductDto })
	@Get(':id')
	async getProduct(@Param('id', ParseIntPipe) id: number): Promise<ProductDto> {
		const product = await this.productsService.getById(id);
		return product;
	}

	@ApiCreatedResponse({ type: ProductDto })
	@Post('/')
	async createProduct(@Body() dto: ProductCreateDto): Promise<ProductDto> {
		const product = await this.productsService.createOne(dto);
		return product;
	}

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

	@Delete(':id')
	async delete(@Param('id', ParseIntPipe) id: number): Promise<ProductDto> {
		return await this.productsService.delete(id);
	}

	// @ApiCreatedResponse({ type: ProductDto })
	@Post('/import')
	async importProduct(@Body() dto: ProductImportDto) {
		// !FIX

		const MOCK_TEMPLATE: ImportTemplate = {
			info: {
				nameKey: 'name',
				imgPathKey: 'imagePath',
				priceKey: 'price',
				discountPriceKey: 'discountPrice',
			},
			paramsKeysInDoc: ['covering', 'material', 'doorThickness', 'height', 'width'],
			attributesKeysInDoc: ['color', 'glassVariant'],
		};

		const createdProducts: ProductDto[] = await this.productsService.importFromFile(
			dto,
			MOCK_TEMPLATE,
		);
		return createdProducts;
	}
}
