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
	categoryType: z
		.enum([CategoryType.exteriorDoors, CategoryType.interiorDoors])
		.default('interiorDoors'),
	description: z.string(),
	isVisible: z.boolean().default(true),
	parentCategoryId: z.number().nullable().default(null),
	order: z.number().nullable().default(null),
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
