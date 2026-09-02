import { z } from 'zod';
import { createPaginatedSchema, PaginationQuerySchema } from './pagination';

export const AUDIT_ACTIONS = [
	'product.created',
	'product.updated',
	'product.deleted',
	'products.imported',

	'variant.created',
	'variant.updated',
	'variant.deleted',

	'attribute.created',
	'attribute.deleted',
	'attribute_key.updated',
	'attribute_value.updated',

	'category.created',
	'category.updated',
	'category.deleted',

	'collection.created',
	'collection.updated',
	'collection.deleted',

	'tag.created',
	'tag.updated',
	'tag.deleted',

	'seo_template.updated',
	'seo_metadata.updated',
	'seo_metadata.deleted',

	'import_template.created',
	'import_template.updated',
	'import_template.deleted',
	'user.created',
] as const;

export const AUDIT_ENTITY_TYPES = [
	'product',
	'product_import',
	'variant',
	'attribute',
	'attribute_key',
	'attribute_value',
	'category',
	'collection',
	'tag',
	'seo_template',
	'seo_metadata',
	'import_template',
	'user',
] as const;

export const AuditActionSchema = z.enum(AUDIT_ACTIONS);
export const AuditEntityTypeSchema = z.enum(AUDIT_ENTITY_TYPES);

export const AuditLogSchema = z.object({
	id: z.number().int(),
	createdAt: z.iso.datetime(),
	actorId: z.number().int().nullable(),
	actorEmail: z.email().nullable(),
	action: AuditActionSchema,
	entityType: AuditEntityTypeSchema,
	entityId: z.string(),
	entityLabel: z.string().nullable(),
	batchId: z.uuid().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
});

export const AuditLogQuerySchema = PaginationQuerySchema.extend({
	entityType: AuditEntityTypeSchema.optional(),
	entityId: z.string().optional(),
	actorId: z.coerce.number().int().positive().optional(),
	actorEmail: z.email().optional(),
	action: AuditActionSchema.optional(),
	batchId: z.uuid().optional(),
	from: z.iso.datetime().optional(),
	to: z.iso.datetime().optional(),
}).refine(({ from, to }) => !from || !to || new Date(from) <= new Date(to), {
	message: '`from` must be before or equal to `to`',
	path: ['from'],
});

export const PaginatedAuditLogSchema = createPaginatedSchema(AuditLogSchema);

export type AuditAction = z.infer<typeof AuditActionSchema>;
export type AuditEntityType = z.infer<typeof AuditEntityTypeSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
