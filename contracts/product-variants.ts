import { z } from 'zod';
import { AttributeSchema } from './attributes';
import { TagSchema } from './tags';
import { BULK_MAX_ITEMS } from './bulk';

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

export const VariantBulkCreateSchema = z
	.object({
		items: z.array(VariantCreateSchema).min(1).max(BULK_MAX_ITEMS),
	})
	.meta({
		title: 'Variant Bulk Create',
	});
export type VariantBulkCreateType = z.infer<typeof VariantBulkCreateSchema>;

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
		attributeIds: z.array(z.number()).optional(),
	});
export type VariantUpdateType = z.infer<typeof VariantUpdateSchema>;

export const VariantBulkUpdateItemSchema = VariantUpdateSchema.extend({
	id: VariantSchema.shape.id,
}).meta({
	title: 'Variant Bulk Update Item',
});

export const VariantBulkUpdateSchema = z
	.object({
		items: z.array(VariantBulkUpdateItemSchema).min(1).max(BULK_MAX_ITEMS),
	})
	.meta({
		title: 'Variant Bulk Update',
	});

export type VariantBulkUpdateItemType = z.infer<typeof VariantBulkUpdateItemSchema>;
export type VariantBulkUpdateType = z.infer<typeof VariantBulkUpdateSchema>;

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
	attributeIds: z.preprocess(parseJsonField, z.array(z.coerce.number()).optional()),
	tags: z.preprocess(parseJsonField, z.array(TagSchema).optional()),
});

type VariantMultipartUpdateFields = z.output<typeof VariantMultipartUpdateSchema>;

type VariantMultipartFiles = {
	image?: File;
	imageFront?: File;
	imageBack?: File;
};

export type VariantMultipartUpdateBody = VariantMultipartUpdateFields &
	(
		| (VariantMultipartFiles & { image: File; categorySlug: string })
		| (VariantMultipartFiles & { imageFront: File; categorySlug: string })
		| (VariantMultipartFiles & { imageBack: File; categorySlug: string })
		| {
				image?: undefined;
				imageFront?: undefined;
				imageBack?: undefined;
		  }
	);
