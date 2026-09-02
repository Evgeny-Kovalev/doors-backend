import { Public } from '@/app/auth/decorators/public.decorator';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { GetCurrentUser } from '@/app/auth/decorators/get-current-user.decorator';
import type { JwtPayload } from '@/app/auth/types';
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
import { CollectionsService } from './collections.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
	CollectionCreateDto,
	CollectionDto,
	CollectionListItemDto,
	CollectionUpdateDto,
} from './dto';
import { visibilityOptionsForUser } from '@/app/shared/visibility';

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
	async findAll(@GetCurrentUser() user?: JwtPayload): Promise<CollectionListItemDto[]> {
		return this.collectionsService.findAll(visibilityOptionsForUser(user));
	}

	@Public()
	@Get(':id')
	@ApiOkResponse({ type: CollectionDto })
	async findOne(
		@Param('id', ParseIntPipe) id: number,
		@GetCurrentUser() user?: JwtPayload,
	): Promise<CollectionDto> {
		return this.collectionsService.findOne(id, visibilityOptionsForUser(user));
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

	@Admin()
	@Delete(':id')
	@ApiOkResponse({ type: CollectionDto })
	delete(@Param('id', ParseIntPipe) id: number) {
		return this.collectionsService.delete(id);
	}
}
