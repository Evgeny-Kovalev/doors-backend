import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../products.service';
import {
	VariantDto,
	VariantCreateDto,
	VariantQueryDto,
	VariantUpdateDto,
} from '../dto/variant.dto';

@ApiTags('Product variants')
@Controller({
	path: 'variants',
	version: '1',
})
export class VariantsController {
	constructor(
		private readonly variantsService: VariantsService,
		private readonly productsService: ProductsService,
	) {}

	@ApiOkResponse({ type: [VariantDto] })
	@Get('/')
	async getAll(@Query() query: VariantQueryDto): Promise<VariantDto[]> {
		const product = await this.productsService.getById(query.productId);
		const variants = await this.variantsService.getAll(product);
		return variants.map((v) => VariantDto.fromEntity(v));
	}

	@ApiOkResponse({ type: VariantDto })
	@Get(':id')
	async getOne(@Param('id') variantId: number): Promise<VariantDto> {
		const variant = await this.variantsService.getById(variantId);
		return VariantDto.fromEntity(variant);
	}

	@ApiCreatedResponse({ type: VariantDto })
	@Post('/')
	@ApiBody({ type: VariantCreateDto })
	async createOne(@Body() dto: VariantCreateDto): Promise<VariantDto> {
		const product = await this.productsService.getById(dto.productId);
		const variant = await this.variantsService.createOne(product, dto);
		return VariantDto.fromEntity(variant);
	}

	@ApiOkResponse({ type: VariantDto })
	@Patch(':id')
	async update(
		@Param('id') variantId: number,
		@Body() variantUpdateDto: VariantUpdateDto,
	): Promise<VariantDto> {
		const updatedVariant = await this.variantsService.update(
			variantId,
			variantUpdateDto,
		);
		return VariantDto.fromEntity(updatedVariant);
	}

	@Delete(':id')
	async deleteOne(@Param('id') id: number) {
		const variant = await this.variantsService.getById(id);
		return await this.variantsService.delete(variant.id);
	}
}
