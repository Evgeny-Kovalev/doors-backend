import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CategoryType as CategoryType2 } from '@prisma/client';

const CategorySchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	imgUrl: z.string(),
	categoryType: z
		.enum([CategoryType2.exteriorDoors, CategoryType2.interiorDoors])
		.default('interiorDoors'),
	description: z.string(),
	isVisible: z.boolean().default(true),
	parentCategoryId: z.number().nullable().default(null),
});

export class CategoryDto extends createZodDto(CategorySchema) {}

const CategoryWithSubCategoriesSchema = CategorySchema.extend({
	children: z.lazy(() => CategoryWithSubCategoriesSchema.array()),
});

export class CategoryWithSubCategories extends createZodDto(
	CategoryWithSubCategoriesSchema,
) {}

const CategoryCreateSchema = CategorySchema.omit({ id: true, slug: true }).partial({
	categoryType: true,
	isVisible: true,
	parentCategoryId: true,
});

type CategoryCreateType = z.infer<typeof CategoryCreateSchema>;
export class CategoryCreateDto extends createZodDto(CategoryCreateSchema) {}

const CategoryUpdateSchema = CategorySchema.omit({ id: true }).partial();

type CategoryUpdateType = z.infer<typeof CategoryUpdateSchema>;
export class CategoryUpdateDto extends createZodDto(CategoryUpdateSchema) {}
