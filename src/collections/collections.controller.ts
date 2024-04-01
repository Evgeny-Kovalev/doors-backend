import { Public } from 'src/auth/decorators/public.decorator';
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CollectionCreateDto, CollectionDto } from './dto';

@ApiTags('Collections')
@Controller({
	path: 'collections',
	version: '1',
})
export class CollectionsController {
	constructor(private readonly collectionsService: CollectionsService) {}

	@Public()
	@Get(':id')
	@ApiOkResponse({ type: [CollectionDto] })
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<CollectionDto> {
		return this.collectionsService.findOne(id);
	}

	@Public()
	@Post()
	create(@Body() dto: CollectionCreateDto) {
		return this.collectionsService.create(dto);
	}
}
