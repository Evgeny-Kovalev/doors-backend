import { z } from 'zod';
import { AttributeSchema } from './attributes';
import { TagSchema } from './tags';

export const VariantSchema = z.object({
	id: z.number(),
	sourceId: z.string().optional().nullable(),
	productId: z.number(),
	imgUrl: z.string(),
	imgFrontUrl: z.string().optional().nullable(),
	imgBackUrl: z.string().optional().nullable(),
	price: z.number().nullable(),
	discountPrice: z.number().nullable(),
	attributes: z.array(AttributeSchema),
	tags: z.array(TagSchema),
});
export type VariantResponse = z.infer<typeof VariantSchema>;

export const VariantCreateSchema = VariantSchema.omit({
	id: true,
	attributes: true,
	tags: true,
})
	.partial({ price: true, discountPrice: true })
	.extend({
		attributeIds: z.array(z.number()).min(1),
		tagIds: z.array(z.number()).optional(),
	});
export type VariantCreateType = z.infer<typeof VariantCreateSchema>;

export const VariantQuerySchema = z.object({
	productId: z.coerce.number().int().positive(),
});
export type VariantQueryType = z.infer<typeof VariantQuerySchema>;

export const VariantUpdateSchema = VariantSchema.omit({
	id: true,
	attributes: true,
	productId: true,
})
	.partial()
	.extend({
		attributeIds: z.array(z.number()).min(1).optional(),
	});
export type VariantUpdateType = z.infer<typeof VariantUpdateSchema>;

const parseJsonField = (value: unknown) => {
	if (typeof value !== 'string') return value;

	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
};

export const VariantMultipartUpdateSchema = VariantUpdateSchema.extend({
	categorySlug: z.string().min(1).optional(),
	price: z.preprocess(
		(value) => (value === '' ? null : value),
		z.coerce.number().nullable().optional(),
	),
	discountPrice: z.preprocess(
		(value) => (value === '' ? null : value),
		z.coerce.number().nullable().optional(),
	),
	attributeIds: z.preprocess(
		parseJsonField,
		z.array(z.coerce.number()).min(1).optional(),
	),
	tags: z.preprocess(parseJsonField, z.array(TagSchema).optional()),
});

type VariantMultipartUpdateFields = z.output<typeof VariantMultipartUpdateSchema>;

export type VariantMultipartUpdateBody = VariantMultipartUpdateFields &
	(
		| {
				image: File;
				categorySlug: string;
		  }
		| {
				image?: undefined;
		  }
	);
