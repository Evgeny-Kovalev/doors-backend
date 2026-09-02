import { z } from 'zod';

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
	id: z.number().int().positive(),
	createdAt: z.iso.datetime({ offset: false }),
	actorId: z.number().int().nullable(),
	actorEmail: z.email().nullable(),
	action: AuditActionSchema,
	entityType: AuditEntityTypeSchema,
	entityId: z.string(),
	entityLabel: z.string().nullable(),
	batchId: z.uuid().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
});

export const AUDIT_LOG_DIRECTIONS = ['older', 'newer'] as const;
export const AuditLogDirectionSchema = z.enum(AUDIT_LOG_DIRECTIONS);

export const AuditLogListQuerySchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(60).default(20),
		cursor: z.string().min(1).optional(),
		direction: AuditLogDirectionSchema.optional(),
		entityType: AuditEntityTypeSchema.optional(),
		entityId: z.string().optional(),
		actorId: z.coerce.number().int().positive().optional(),
		actorEmail: z.email().optional(),
		action: AuditActionSchema.optional(),
		batchId: z.uuid().optional(),
		from: z.iso.datetime({ offset: false }).optional(),
		to: z.iso.datetime({ offset: false }).optional(),
	})
	.superRefine(({ cursor, direction, from, to }, context) => {
		if (direction && !cursor) {
			context.addIssue({
				code: 'custom',
				message: '`direction` requires `cursor`',
				path: ['direction'],
			});
		}
		if (from && to && new Date(from) > new Date(to)) {
			context.addIssue({
				code: 'custom',
				message: '`from` must be before or equal to `to`',
				path: ['from'],
			});
		}
	});

export const AuditLogPageInfoSchema = z.object({
	startCursor: z.string().nullable(),
	endCursor: z.string().nullable(),
	hasNewerPage: z.boolean(),
	hasOlderPage: z.boolean(),
});

export const AuditLogListResponseSchema = z.object({
	data: z.array(AuditLogSchema),
	pageInfo: AuditLogPageInfoSchema,
});

export const AuditLogParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export type AuditAction = z.infer<typeof AuditActionSchema>;
export type AuditEntityType = z.infer<typeof AuditEntityTypeSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type AuditLogDirection = z.infer<typeof AuditLogDirectionSchema>;
export type AuditLogListQuery = z.infer<typeof AuditLogListQuerySchema>;
export type AuditLogPageInfo = z.infer<typeof AuditLogPageInfoSchema>;
export type AuditLogListResponse = z.infer<typeof AuditLogListResponseSchema>;
export type AuditLogParams = z.infer<typeof AuditLogParamsSchema>;
