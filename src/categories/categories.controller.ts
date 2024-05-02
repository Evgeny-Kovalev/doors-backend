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
import {
	CategoryCreateDto,
	CategoryDto,
	CategoryUpdateDto,
	CategoryWithSubCategories,
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
	async getAllCategories(): Promise<CategoryWithSubCategories[]> {
		const allCategories = await this.categoriesService.getAll();

		const categoryWithSubCategories =
			this.categoriesService.formatAllCategories(allCategories);

		return categoryWithSubCategories;
	}

	@Public()
	@ApiOkResponse({ type: CategoryDto })
	@Get(':slug')
	async getCategory(@Param('slug') slug: string): Promise<CategoryWithSubCategories> {
		const category = await this.categoriesService.getBySlug(slug);
		const allCategories = await this.categoriesService.getAll();

		const categoryWithSubCategories = this.categoriesService.formatOneCategory(
			category,
			allCategories,
		);

		return categoryWithSubCategories;
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({ type: CategoryDto })
	@Post('/')
	async createCategory(
		@Body() dto: CategoryCreateDto,
	): Promise<CategoryWithSubCategories> {
		const createdCategory = await this.categoriesService.createOne(dto);
		const allCategories = await this.categoriesService.getAll();

		const categoryWithSubCategories = this.categoriesService.formatOneCategory(
			createdCategory,
			allCategories,
		);
		return categoryWithSubCategories;
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
		const allCategories = await this.categoriesService.getAll();

		const categoryWithSubCategories = this.categoriesService.formatOneCategory(
			updatedCategory,
			allCategories,
		);

		return categoryWithSubCategories;
	}

	@ApiBearerAuth()
	@Delete(':id')
	delete(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.delete(id);
	}
}
