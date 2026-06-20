import { Public } from '@/app/auth/decorators/public.decorator';
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CollectionCreateDto, CollectionDto, CollectionUpdateDto } from './dto';
import { HasRoles } from '@/app/auth/decorators/has-roles.decorator';
import { Role } from '@/app/generated/prisma';
import { RolesGuard } from '@/app/auth/guards/roles.guard';

@ApiTags('Collections')
@Controller({
	path: 'collections',
	version: '1',
})
export class CollectionsController {
	constructor(private readonly collectionsService: CollectionsService) {}

	@Public()
	@Get()
	@ApiOkResponse({ type: [CollectionDto] })
	async findAll(): Promise<CollectionDto[]> {
		return this.collectionsService.findAll();
	}

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

	@ApiBearerAuth()
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: CollectionUpdateDto) {
		return this.collectionsService.update(id, dto);
	}
}
