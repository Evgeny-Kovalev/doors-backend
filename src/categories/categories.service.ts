import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryCreateDto, CategoryDto, CategoryUpdateDto } from './dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
	constructor(private readonly prismaService: PrismaService) {}

	async getAll(): Promise<CategoryDto[]> {
		const categories: Category[] = await this.prismaService.category.findMany();
		return categories;
	}

	async getById(id: number): Promise<CategoryDto> {
		const category = await this.prismaService.category.findFirst({ where: { id } });
		if (!category) throw new BadRequestException('Category with this id not found');
		return category;
	}

	async createOne(dto: CategoryCreateDto) {
		const { name, description, imgUrl, isVisible, parentId } = dto;
		try {
			const createdCategory = await this.prismaService.category.create({
				data: {
					name,
					description,
					imgUrl,
					isVisible,
					parentCategoryId: parentId,
				},
			});
			return createdCategory;
		} catch (e) {
			throw new BadRequestException('Cannot create the category');
		}
	}

	async update(categoryId: number, dto: CategoryUpdateDto) {
		await this.getById(categoryId);
		const { name, description, imgUrl, isVisible, parentId } = dto;

		try {
			const updatedCategory = await this.prismaService.category.update({
				data: {
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
			throw new BadRequestException('Cannot update the category');
		}
	}

	async delete(categoryId: number) {
		await this.getById(categoryId);
		try {
			return await this.prismaService.category.delete({ where: { id: categoryId } });
		} catch (e) {
			throw new BadRequestException('Cannot delete category');
		}
	}
}
