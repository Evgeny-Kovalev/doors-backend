import { Public } from 'src/auth/decorators/public.decorator';
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CollectionCreateDto, CollectionDto } from './dto';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';

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

	@ApiBearerAuth()
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Post()
	create(@Body() dto: CollectionCreateDto) {
		return this.collectionsService.create(dto);
	}
}
