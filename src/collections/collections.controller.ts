import { Public } from '@/app/auth/decorators/public.decorator';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
	CollectionCreateDto,
	CollectionDto,
	CollectionListItemDto,
	CollectionUpdateDto,
} from './dto';

@ApiTags('Collections')
@Controller({
	path: 'collections',
	version: '1',
})
export class CollectionsController {
	constructor(private readonly collectionsService: CollectionsService) {}

	@Public()
	@Get()
	@ApiOkResponse({ type: [CollectionListItemDto] })
	async findAll(): Promise<CollectionListItemDto[]> {
		return this.collectionsService.findAll();
	}

	@Public()
	@Get(':id')
	@ApiOkResponse({ type: CollectionDto })
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<CollectionDto> {
		return this.collectionsService.findOne(id);
	}

	@Admin()
	@Post()
	create(@Body() dto: CollectionCreateDto) {
		return this.collectionsService.create(dto);
	}

	@Admin()
	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: CollectionUpdateDto) {
		return this.collectionsService.update(id, dto);
	}
}
