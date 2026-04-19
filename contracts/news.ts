import { z } from 'zod';

export const NewsTypeSchema = z.enum(['NEWS', 'PROMOTION']);
export type NewsType = z.infer<typeof NewsTypeSchema>;

export const NewsPreviewApiSchema = z.object({
	id: z.number(),
	slug: z.string(),
	title: z.string(),
	description: z.string(),
	coverImageUrl: z.string(),
	publishedAt: z.string(),
	type: NewsTypeSchema,
	markdownUrl: z.string(),
});
export type NewsPreviewApiType = z.infer<typeof NewsPreviewApiSchema>;
