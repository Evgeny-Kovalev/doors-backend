import { z } from 'zod';
import { AttributeSchema } from './attributes';

export const VariantSchema = z.object({
	id: z.number(),
	productId: z.number(),
	imgUrl: z.string(),
	price: z.number().nullable().default(null),
	discountPrice: z.number().nullable().default(null),
	attributes: z.array(AttributeSchema),
});
export type VariantType = z.infer<typeof VariantSchema>;

export const VariantCreateSchema = VariantSchema.omit({
	id: true,
	attributes: true,
})
	.partial({ price: true, discountPrice: true })
	.extend({
		attributeIds: z.array(z.number()).min(1),
	});
export type VariantCreateType = z.infer<typeof VariantCreateSchema>;

export const VariantUpdateSchema = VariantSchema.omit({
	id: true,
	attributes: true,
	productId: true,
})
	.partial()
	.extend({
		attributeIds: z.array(z.number()).min(1),
	});
export type VariantUpdateType = z.infer<typeof VariantUpdateSchema>;
