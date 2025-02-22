import { z } from 'zod';

export const AttributeKeySchema = z.object({
	id: z.number(),
	value: z.string(),
	label: z.string(),
	imgUrl: z.string().nullable().default(null),
});
export type AttributeKeyType = z.infer<typeof AttributeKeySchema>;

export const AttributeKeyCreateSchema = AttributeKeySchema.omit({ id: true }).partial({
	imgUrl: true,
});
export type AttributeKeyCreateType = z.infer<typeof AttributeKeyCreateSchema>;
