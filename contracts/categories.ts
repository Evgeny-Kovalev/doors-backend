import { z } from 'zod';
import { CategoryType as CategoryType2 } from '@prisma/client';

export const CategorySchema = z.object({
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
export type CategoryType = z.infer<typeof CategorySchema>;

export const CategoryWithSubCategoriesSchema = CategorySchema.extend({
	children: z.lazy(() => CategoryWithSubCategoriesSchema.array()),
});
export type CategoryWithSubCategoriesType = z.infer<
	typeof CategoryWithSubCategoriesSchema
>;

export const CategoryCreateSchema = CategorySchema.omit({ id: true, slug: true }).partial(
	{
		categoryType: true,
		isVisible: true,
		parentCategoryId: true,
	},
);
export type CategoryCreateType = z.infer<typeof CategoryCreateSchema>;

export const CategoryUpdateSchema = CategorySchema.omit({ id: true }).partial();
export type CategoryUpdateType = z.infer<typeof CategoryUpdateSchema>;
