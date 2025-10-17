import { z } from 'zod';

export const ImportTemplateSchema = z
	.object({
		info: z.object({
			nameKey: z.string(),
			imgPathKey: z.string(),
			priceKey: z.string(),
			discountPriceKey: z.string(),
		}),
		paramsKeysInDoc: z.array(z.string()),
		attributesKeysInDoc: z.array(z.string()),
	})
	.meta({
		title: 'Import Template',
	});

export type ImportTemplateType = z.infer<typeof ImportTemplateSchema>;

export const ProductImportSchema = z
	.object({
		categoryId: z.number(),
		fileName: z.string(),
		template: ImportTemplateSchema,
	})
	.meta({
		title: 'Product Import',
	});
