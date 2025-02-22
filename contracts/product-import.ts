import { z } from 'zod';

export const ImportTemplateSchema = z.object({
	info: z.object({
		nameKey: z.string(),
		imgPathKey: z.string(),
		priceKey: z.string(),
		discountPriceKey: z.string(),
	}),
	paramsKeysInDoc: z.array(z.string()),
	attributesKeysInDoc: z.array(z.string()),
});

export type ImportTemplateType = z.infer<typeof ImportTemplateSchema>;
