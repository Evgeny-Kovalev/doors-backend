import { z } from 'zod';

export const SeoEntityTypeSchema = z.enum(['category', 'product']);
export type SeoEntityType = z.infer<typeof SeoEntityTypeSchema>;

export const SeoTemplateVariableSchema = z.enum([
	'name',
	'category',
	'minPrice',
	'maxPrice',
]);
export type SeoTemplateVariable = z.infer<typeof SeoTemplateVariableSchema>;

export const SEO_TEMPLATE_VARIABLES = {
	product: ['name', 'category', 'minPrice', 'maxPrice'],
	category: ['name'],
} as const satisfies Record<SeoEntityType, readonly SeoTemplateVariable[]>;

export type SeoTemplateVariables<T extends SeoEntityType> = {
	[V in (typeof SEO_TEMPLATE_VARIABLES)[T][number]]: string;
};

export const SeoTemplateSchema = z.object({
	entityType: SeoEntityTypeSchema,
	titleTemplate: z.string(),
	descriptionTemplate: z.string(),
	availableVariables: z.array(SeoTemplateVariableSchema),
});

export const SeoTemplateUpdateSchema = z.object({
	titleTemplate: z.string().min(1),
	descriptionTemplate: z.string().min(1),
});

export type SeoTemplate = z.infer<typeof SeoTemplateSchema>;
export type SeoTemplateUpdateType = z.infer<typeof SeoTemplateUpdateSchema>;

export const SeoMetadataSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
});

export type SeoMetadataResponse = z.infer<typeof SeoMetadataSchema>;
export type SeoMetadataUpdateType = SeoMetadataResponse;

export const ResolvedSeoMetadataSchema = z.object({
	title: z.string(),
	description: z.string(),
});

export type ResolvedSeoMetadata = z.infer<typeof ResolvedSeoMetadataSchema>;
