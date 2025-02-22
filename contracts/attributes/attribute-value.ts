import { z } from 'zod';

export const AttributeValueSchema = z.object({
	id: z.number(),
	value: z.string(),
});
export type AttributeValueType = z.infer<typeof AttributeValueSchema>;

export const AttributeValueCreateSchema = AttributeValueSchema.omit({ id: true });
export type AttributeValueCreateType = z.infer<typeof AttributeValueCreateSchema>;
