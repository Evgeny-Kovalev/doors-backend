import { z } from 'zod';

export const ImportTemplateInfoSchema = z.object({
	sourceIdKey: z.string(),
	nameKey: z.string(),
	imgPathKey: z.string(),
	imgFrontKey: z.string().optional(),
	imgBackKey: z.string().optional(),
	priceKey: z.string(),
	discountPriceKey: z.string(),
	tagsKey: z.string().optional(),
	isMainKey: z.string().optional(),
	categorySlugKey: z.string().optional(),
});
export type ImportTemplateInfoType = z.infer<typeof ImportTemplateInfoSchema>;

// Mapping config used by the import pipeline (info keys + param/attribute columns)
export const ImportTemplateConfigSchema = z
	.object({
		info: ImportTemplateInfoSchema,
		paramsKeysInDoc: z.array(z.string()),
		attributesKeysInDoc: z.array(z.string()),
	})
	.meta({
		title: 'Import Template Config',
	});
export type ImportTemplateConfig = z.infer<typeof ImportTemplateConfigSchema>;

export const ImportTemplateSchema = ImportTemplateConfigSchema.extend({
	id: z.number(),
	slug: z.string().min(1),
	name: z.string().min(1),
}).meta({
	title: 'Import Template',
});
export type ImportTemplate = z.infer<typeof ImportTemplateSchema>;

export const ImportTemplateCreateSchema = ImportTemplateSchema.omit({ id: true });
export type ImportTemplateCreateType = z.infer<typeof ImportTemplateCreateSchema>;

export const ImportTemplateUpdateSchema = ImportTemplateCreateSchema.partial();
export type ImportTemplateUpdateType = z.infer<typeof ImportTemplateUpdateSchema>;

export const ProductImportSchema = z
	.object({
		categoryId: z.coerce.number(),
		templateId: z.coerce.number(),
	})
	.meta({
		title: 'Product Import',
	});

export type ProductImportType = z.infer<typeof ProductImportSchema>;
