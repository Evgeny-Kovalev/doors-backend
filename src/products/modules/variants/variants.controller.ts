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
	UploadedFile,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
	VariantCreateDto,
	VariantDto,
	VariantMultipartUpdateDto,
	VariantQueryDto,
} from './variant.dto';
import { Public } from '@/app/auth/decorators/public.decorator';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { ApiFileWithBody } from '@/app/files/decorators/api-file.decorator';

@ApiTags('Product variants')
@Controller({
	path: 'variants',
	version: '1',
})
export class VariantsController {
	constructor(private readonly variantsService: VariantsService) {}

	@Public()
	@ApiOkResponse({ type: [VariantDto] })
	@Get('/')
	async getAll(@Query() query: VariantQueryDto): Promise<VariantDto[]> {
		return this.variantsService.getAll(query.productId);
	}

	@Public()
	@ApiOkResponse({ type: VariantDto })
	@Get(':id')
	async getOne(@Param('id', ParseIntPipe) variantId: number): Promise<VariantDto> {
		return this.variantsService.getById(variantId);
	}

	@Admin()
	@ApiCreatedResponse({ type: VariantDto })
	@Post('/')
	@ApiBody({ type: VariantCreateDto })
	async createOne(@Body() dto: VariantCreateDto): Promise<VariantDto> {
		return this.variantsService.createOne(dto.productId, dto);
	}

	@Admin()
	@ApiOkResponse({ type: VariantDto })
	@ApiFileWithBody({
		bodyType: VariantMultipartUpdateDto,
		fileName: 'image',
		required: false,
		mimetype: ['image'],
	})
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) variantId: number,
		@Body() dto: VariantMultipartUpdateDto,
		@UploadedFile() image?: Express.Multer.File,
	): Promise<VariantDto> {
		return this.variantsService.update(variantId, dto, image);
	}

	@Admin()
	@Delete(':id')
	async deleteOne(@Param('id', ParseIntPipe) id: number): Promise<VariantDto> {
		return this.variantsService.deleteById(id);
	}
}
