import { z } from 'zod';

export const CategoryType = {
	interiorDoors: 'interiorDoors',
	exteriorDoors: 'exteriorDoors',
} as const;

export const CategorySchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	imgUrl: z.string(),
	categoryType: z.enum([CategoryType.exteriorDoors, CategoryType.interiorDoors]),
	description: z.string(),
	isVisible: z.boolean(),
	parentCategoryId: z.number().nullable(),
	order: z.number().nullable(),
});
export type CategoryResponse = z.infer<typeof CategorySchema>;

export const CategoryCreateSchema = CategorySchema.omit({ id: true, slug: true }).partial(
	{
		categoryType: true,
		isVisible: true,
		parentCategoryId: true,
		order: true,
	},
);
export type CategoryCreateType = z.infer<typeof CategoryCreateSchema>;

export const CategoryUpdateSchema = CategorySchema.omit({ id: true }).partial();
export type CategoryUpdateType = z.infer<typeof CategoryUpdateSchema>;

export const CategoryQuerySchema = z.object({
	parentCategorySlug: z.string().optional(),
});
export type CategoryQueryType = z.infer<typeof CategoryQuerySchema>;
