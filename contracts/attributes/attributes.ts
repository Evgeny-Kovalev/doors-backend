import { z } from 'zod';
import { AttributeValueCreateSchema, AttributeValueSchema } from './attribute-value';
import { AttributeKeyCreateSchema, AttributeKeySchema } from './attribute-key';

export const AttributeSchema = z.object({
	id: z.number(),
	key: AttributeKeySchema,
	value: AttributeValueSchema,
});
export type AttributeType = z.infer<typeof AttributeSchema>;

export const AttributeCreateSchema = z.object({
	key: AttributeKeyCreateSchema,
	value: AttributeValueCreateSchema,
});
export type AttributeCreateType = z.infer<typeof AttributeCreateSchema>;
