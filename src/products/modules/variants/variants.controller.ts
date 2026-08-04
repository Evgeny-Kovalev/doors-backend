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
	UploadedFiles,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
	VariantBulkCreateDto,
	VariantBulkUpdateDto,
	VariantDto,
	VariantMultipartUpdateDto,
	VariantQueryDto,
} from './variant.dto';
import { Public } from '@/app/auth/decorators/public.decorator';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { ApiFilesWithBody } from '@/app/files/decorators/api-file.decorator';

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
	@ApiCreatedResponse({ type: [VariantDto] })
	@Post('/')
	@ApiBody({ type: VariantBulkCreateDto })
	async createMany(@Body() dto: VariantBulkCreateDto): Promise<VariantDto[]> {
		return this.variantsService.createMany(dto);
	}

	@Admin()
	@ApiOkResponse({ type: [VariantDto] })
	@Patch('/')
	async updateMany(@Body() dto: VariantBulkUpdateDto): Promise<VariantDto[]> {
		return this.variantsService.updateMany(dto);
	}

	@Admin()
	@ApiOkResponse({ type: VariantDto })
	@ApiFilesWithBody({
		bodyType: VariantMultipartUpdateDto,
		fileFields: [{ name: 'image' }, { name: 'imageFront' }, { name: 'imageBack' }],
		mimetype: ['image'],
	})
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) variantId: number,
		@Body() dto: VariantMultipartUpdateDto,
		@UploadedFiles()
		files?: {
			image?: Express.Multer.File[];
			imageFront?: Express.Multer.File[];
			imageBack?: Express.Multer.File[];
		},
	): Promise<VariantDto> {
		return this.variantsService.update(variantId, dto, {
			image: files?.image?.[0],
			imageFront: files?.imageFront?.[0],
			imageBack: files?.imageBack?.[0],
		});
	}

	@Admin()
	@Delete(':id')
	async deleteOne(@Param('id', ParseIntPipe) id: number): Promise<VariantDto> {
		return this.variantsService.deleteById(id);
	}
}
