import { z } from 'zod';

export const TagSchema = z.object({
	id: z.number(),
	key: z.string(),
	label: z.string(),
});
export type TagResponse = z.infer<typeof TagSchema>;

export const TagCreateSchema = TagSchema.omit({ id: true });
export type TagCreateDtoType = z.infer<typeof TagCreateSchema>;

export const TagUpdateSchema = TagCreateSchema.partial();
export type TagUpdateDtoType = z.infer<typeof TagUpdateSchema>;
