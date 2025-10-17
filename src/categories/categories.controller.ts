import { Public } from './../auth/decorators/public.decorator';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
	ParseIntPipe,
	UseGuards,
	Query,
} from '@nestjs/common';

import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
	CategoryDto,
	CategoryCreateDto,
	CategoryUpdateDto,
	CategoryQueryDto,
} from './dto';

@ApiTags('Categories')
@Controller({
	path: 'categories',
	version: '1',
})
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Public()
	@ApiOkResponse({ type: [CategoryDto] })
	@Get('/')
	async getAllCategories(@Query() query: CategoryQueryDto): Promise<CategoryDto[]> {
		const allCategories = await this.categoriesService.getAll(query);
		return allCategories;
	}

	@Public()
	@ApiOkResponse({ type: CategoryDto })
	@Get(':slug')
	async getCategory(@Param('slug') slug: string): Promise<CategoryDto> {
		const category = await this.categoriesService.getBySlug(slug);
		return category;
	}

	@Public()
	@ApiOkResponse({ type: [CategoryDto] })
	@Get(':slug/hierarchy')
	async getCategoryHierarchy(@Param('slug') slug: string): Promise<CategoryDto[]> {
		const category = await this.categoriesService.getBySlug(slug);
		const categories = await this.categoriesService.getCategoryHierarchy(category);
		return categories;
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: CategoryDto })
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Post('/')
	async createCategory(@Body() dto: CategoryCreateDto): Promise<CategoryDto> {
		const createdCategory = await this.categoriesService.createOne(dto);
		return createdCategory;
	}

	@ApiBearerAuth()
	@ApiOkResponse({ type: CategoryDto })
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) categoryId: number,
		@Body() categoryUpdateDto: CategoryUpdateDto,
	): Promise<CategoryDto> {
		return await this.categoriesService.update(categoryId, categoryUpdateDto);
	}

	@ApiBearerAuth()
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Delete(':id')
	delete(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.delete(id);
	}
}
