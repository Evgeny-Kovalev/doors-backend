import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
	CategoryCreateDto,
	CategoryDto,
	CategoryQueryDto,
	CategoryUpdateDto,
} from './dto';
import { Category } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly logger = new Logger(CategoriesService.name);

	async getAll(dto: CategoryQueryDto): Promise<CategoryDto[]> {
		const categories: Category[] = await this.prismaService.category.findMany({
			where: {
				parentCategory: {
					slug: dto.parentCategorySlug,
				},
			},
		});
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
		const { name, description, imgUrl, isVisible, parentCategoryId, categoryType } =
			dto;

		const parentId = parentCategoryId
			? (await this.getById(parentCategoryId)).id
			: null;

		try {
			const createdCategory = await this.prismaService.category.create({
				data: {
					slug: slugify(name, { lower: true }),
					name,
					description,
					imgUrl,
					isVisible,
					parentCategoryId: parentId,
					categoryType,
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
		const { name, description, imgUrl, isVisible, parentCategoryId, slug } = dto;

		try {
			const updatedCategory = await this.prismaService.category.update({
				data: {
					slug: slug || (name && slugify(name, { lower: true })),
					name,
					description,
					imgUrl,
					isVisible,
					parentCategoryId,
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

	async getCategoryHierarchy(category: CategoryDto): Promise<CategoryDto[]> {
		const categories = await this.prismaService.$queryRaw<Category[]>`
			WITH RECURSIVE cat_path AS (
				SELECT id, slug, name, "imgUrl", description, "isVisible", "parentCategoryId", "categoryType", 0 AS depth
				FROM "Category"
				WHERE id = ${category.id}
				UNION ALL
				SELECT c.id, c.slug, c.name, c."imgUrl", c.description, c."isVisible", c."parentCategoryId", c."categoryType", cp.depth + 1
				FROM "Category" c
				JOIN cat_path cp ON c.id = cp."parentCategoryId"
			)
			SELECT id, slug, name, "imgUrl", description, "isVisible", "parentCategoryId", "categoryType"
			FROM cat_path
			ORDER BY depth DESC;
		`;

		return categories;
	}

	async getChildren(category: CategoryDto): Promise<CategoryDto[]> {
		const categories = await this.prismaService.category.findMany({
			where: { parentCategoryId: category.id },
		});
		return categories;
	}

	async getDescendantCategoryIdsBySlug(slug: string): Promise<number[]> {
		const rows = await this.prismaService.$queryRaw<{ id: number }[]>`
			WITH RECURSIVE subs AS (
				SELECT id, "parentCategoryId"
				FROM "Category"
				WHERE slug = ${slug}
				UNION ALL
				SELECT c.id, c."parentCategoryId"
				FROM "Category" c
				JOIN subs s ON c."parentCategoryId" = s.id
			)
			SELECT id FROM subs;
		`;
		return rows.map((r) => r.id);
	}
}
