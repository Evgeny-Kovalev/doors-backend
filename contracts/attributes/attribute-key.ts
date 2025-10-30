import { z } from 'zod';

export const AttributeKeySchema = z.object({
	id: z.number(),
	value: z.string(),
	label: z.string(),
});
export type AttributeKeyType = z.infer<typeof AttributeKeySchema>;

export const AttributeKeyCreateSchema = AttributeKeySchema.omit({ id: true });
export type AttributeKeyCreateType = z.infer<typeof AttributeKeyCreateSchema>;

export const AttributeKeyUpdateSchema = AttributeKeyCreateSchema.partial();
export type AttributeKeyUpdateType = z.infer<typeof AttributeKeyUpdateSchema>;
