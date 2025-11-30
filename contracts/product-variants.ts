import { z } from 'zod';
import { AttributeSchema } from './attributes';
import { TagSchema } from './tags';

export const VariantSchema = z.object({
	id: z.number(),
	productId: z.number(),
	imgUrl: z.string(),
	price: z.number().nullable(),
	discountPrice: z.number().nullable(),
	attributes: z.array(AttributeSchema),
	tags: z.array(TagSchema),
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
