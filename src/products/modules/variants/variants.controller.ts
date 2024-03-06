import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../../products.service';
import {
	VariantCreateDto,
	VariantDto,
	VariantQueryDto,
	VariantUpdateDto,
} from './variant.dto';

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
		return variants;
	}

	@ApiOkResponse({ type: VariantDto })
	@Get(':id')
	async getOne(@Param('id', ParseIntPipe) variantId: number): Promise<VariantDto> {
		const variant = await this.variantsService.getById(variantId);
		return variant;
	}

	@ApiCreatedResponse({ type: VariantDto })
	@Post('/')
	@ApiBody({ type: VariantCreateDto })
	async createOne(@Body() dto: VariantCreateDto): Promise<VariantDto> {
		const product = await this.productsService.getById(dto.productId);
		const variant = await this.variantsService.createOne(product, dto);
		return variant;
	}

	@ApiOkResponse({ type: VariantDto })
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) variantId: number,
		@Body() variantUpdateDto: VariantUpdateDto,
	): Promise<VariantDto> {
		const updatedVariant = await this.variantsService.update(
			variantId,
			variantUpdateDto,
		);
		return updatedVariant;
	}

	@Delete(':id')
	async deleteOne(@Param('id', ParseIntPipe) id: number): Promise<VariantDto> {
		return await this.variantsService.deleteById(id);
	}
}
