import { Public } from '../auth/decorators/public.decorator';
import { Admin } from '../auth/decorators/admin.decorator';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
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

import { TagCreateDto, TagDto, TagUpdateDto } from './dto';

@ApiTags('Tags')
@Controller({
	path: 'tags',
	version: '1',
})
export class TagsController {
	constructor(private readonly tagsService: TagsService) {}

	@Public()
	@ApiOkResponse({ type: [TagDto] })
	@Get('/')
	async getAll(): Promise<TagDto[]> {
		return this.tagsService.findAll();
	}

	@Admin()
	@ApiCreatedResponse({ type: TagDto })
	@Post('/')
	async create(@Body() dto: TagCreateDto): Promise<TagDto> {
		return this.tagsService.create(dto);
	}

	@Admin()
	@ApiOkResponse({ type: TagDto })
	@Patch('/:id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: TagUpdateDto,
	): Promise<TagDto> {
		return this.tagsService.update(id, dto);
	}

	@Admin()
	@ApiOkResponse({ type: TagDto })
	@Delete('/:id')
	async delete(@Param('id', ParseIntPipe) id: number): Promise<TagDto> {
		return this.tagsService.delete(id);
	}
}
