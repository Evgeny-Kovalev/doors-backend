import { Queue } from './../utils/Queue';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
	CategoryCreateDto,
	CategoryDto,
	CategoryUpdateDto,
	CategoryWithSubCategories,
} from './dto';
import { Category } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly logger = new Logger(CategoriesService.name);

	async getAll(): Promise<CategoryDto[]> {
		const categories: Category[] = await this.prismaService.category.findMany();
		return categories;
	}

	async getById(id: number): Promise<CategoryDto> {
		const category = await this.prismaService.category.findFirst({ where: { id } });
		if (!category) throw new BadRequestException('Category with this id not found');
		return category;
	}

	async getBySlug(slug: string): Promise<CategoryDto> {
		const category = await this.prismaService.category.findFirst({ where: { slug } });
		if (!category) throw new BadRequestException('Category with this slug not found');
		return category;
	}

	async createOne(dto: CategoryCreateDto): Promise<CategoryDto> {
		const { name, description, imgUrl, isVisible, parentId } = dto;

		const parentCategory = parentId ? await this.getById(parentId) : undefined;

		try {
			const createdCategory = await this.prismaService.category.create({
				data: {
					slug: slugify(name, { lower: true }),
					name,
					description,
					imgUrl,
					isVisible,
					parentCategoryId: parentCategory?.id ?? undefined,
				},
			});
			return createdCategory;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot create the category');
		}
	}

	async update(categoryId: number, dto: CategoryUpdateDto): Promise<CategoryDto> {
		await this.getById(categoryId);
		const { name, description, imgUrl, isVisible, parentId } = dto;

		try {
			const updatedCategory = await this.prismaService.category.update({
				data: {
					slug: name && slugify(name, { lower: true }),
					name,
					description,
					imgUrl,
					isVisible,
					parentCategoryId: parentId,
				},
				where: { id: categoryId },
			});
			return updatedCategory;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot update the category');
		}
	}

	async delete(categoryId: number): Promise<CategoryDto> {
		await this.getById(categoryId);
		try {
			return await this.prismaService.category.delete({ where: { id: categoryId } });
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot delete category');
		}
	}

	formatAllCategories(allCategories: CategoryDto[]): CategoryWithSubCategories[] {
		const rootCategories = allCategories.filter((cat) => cat.parentCategoryId === null);
		if (rootCategories.length === 0) return [];

		const res: CategoryWithSubCategories[] = [];

		for (const rootCat of rootCategories) {
			const categoryWithSub = this.formatOneCategory(rootCat, allCategories);
			res.push(categoryWithSub);
		}
		return res;
	}

	formatOneCategory(
		category: CategoryDto,
		allCategories: CategoryDto[],
	): CategoryWithSubCategories {
		return {
			...category,
			children: this.getAllChildren(allCategories, category),
		};
	}

	private getAllChildren(
		allCategories: CategoryDto[],
		category: CategoryDto,
	): CategoryWithSubCategories[] {
		const children = allCategories.filter(
			(cat) => cat.parentCategoryId === category.id,
		);
		if (children.length === 0) return [];

		const childrenWithSubCategories: CategoryWithSubCategories[] = [];

		children.forEach((item) => {
			const children = this.getAllChildren(allCategories, item);
			childrenWithSubCategories.push({
				...item,
				children,
			});
		});

		return childrenWithSubCategories;
	}

	async getNestedCategoriesList(
		category: CategoryDto,
		allCategories: CategoryDto[],
	): Promise<CategoryDto[]> {
		const getChildren = (category: CategoryDto): CategoryDto[] =>
			allCategories.filter((cat) => cat.parentCategoryId === category.id);

		const nestedCategories: CategoryDto[] = [];

		const queue = new Queue<CategoryDto>();

		const children = getChildren(category);
		children.forEach((cat) => queue.enqueue(cat));

		while (!queue.isEmpty) {
			const cat = queue.dequeue();
			nestedCategories.push(cat);
			const children = getChildren(cat);
			children.forEach((cat) => queue.enqueue(cat));
		}
		return [category, ...nestedCategories];
	}
}
