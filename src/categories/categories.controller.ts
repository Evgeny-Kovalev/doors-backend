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
} from '@nestjs/common';
import { CategoryCreateDto, CategoryDto, CategoryUpdateDto } from './dto';

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
	async getAllCategories() {
		const categories = await this.categoriesService.getAll();
		return categories;
	}

	@Public()
	@ApiOkResponse({ type: CategoryDto })
	@Get(':id')
	async getCategory(@Param('id', ParseIntPipe) id: number) {
		const category = await this.categoriesService.getById(id);
		return category;
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: CategoryDto })
	@Post('/')
	async createCategory(@Body() dto: CategoryCreateDto) {
		const createdCategory = await this.categoriesService.createOne(dto);
		return createdCategory;
	}

	@ApiBearerAuth()
	@ApiOkResponse({ type: CategoryDto })
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) categoryId: number,
		@Body() categoryUpdateDto: CategoryUpdateDto,
	) {
		const updatedCategory = await this.categoriesService.update(
			categoryId,
			categoryUpdateDto,
		);
		return updatedCategory;
	}

	@ApiBearerAuth()
	@Delete(':id')
	delete(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.delete(id);
	}
}
