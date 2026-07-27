import { Public } from '@/app/auth/decorators/public.decorator';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ImportTemplatesService } from './import-templates.service';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
} from '@nestjs/common';
import {
	ImportTemplateCreateDto,
	ImportTemplateDto,
	ImportTemplateUpdateDto,
} from './dto';

@ApiTags('Import Templates')
@Controller({
	path: 'import-templates',
	version: '1',
})
export class ImportTemplatesController {
	constructor(private readonly importTemplatesService: ImportTemplatesService) {}

	@Public()
	@ApiOkResponse({ type: [ImportTemplateDto] })
	@Get('/')
	async getAll(): Promise<ImportTemplateDto[]> {
		return this.importTemplatesService.findAll();
	}

	@Public()
	@ApiOkResponse({ type: ImportTemplateDto })
	@Get('/:id')
	async getById(@Param('id', ParseIntPipe) id: number): Promise<ImportTemplateDto> {
		return this.importTemplatesService.findById(id);
	}

	@Public()
	@ApiCreatedResponse({ type: ImportTemplateDto })
	@Post('/')
	async create(@Body() dto: ImportTemplateCreateDto): Promise<ImportTemplateDto> {
		return this.importTemplatesService.create(dto);
	}

	@Public()
	@ApiOkResponse({ type: ImportTemplateDto })
	@Patch('/:id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: ImportTemplateUpdateDto,
	): Promise<ImportTemplateDto> {
		return this.importTemplatesService.update(id, dto);
	}

	@Public()
	@ApiOkResponse({ type: ImportTemplateDto })
	@Delete('/:id')
	async delete(@Param('id', ParseIntPipe) id: number): Promise<ImportTemplateDto> {
		return this.importTemplatesService.delete(id);
	}
}
