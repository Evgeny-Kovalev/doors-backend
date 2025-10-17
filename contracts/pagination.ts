import { z } from 'zod';

export const PaginationQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(60).default(20),
	})
	.meta({
		title: 'Pagination query params',
	});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginationMetaSchema = z
	.object({
		page: z.number().int().min(1),
		limit: z.number().int().min(1),
		itemCount: z.number().int().min(0),
		pageCount: z.number().int().min(0),
		hasPreviousPage: z.boolean(),
		hasNextPage: z.boolean(),
	})
	.meta({
		title: 'Pagination meta data',
	});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const createPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z
		.object({
			data: z.array(itemSchema),
			meta: PaginationMetaSchema,
		})
		.meta({
			title: 'Paginated response',
		});
