import { z } from 'zod';

export const UserSchema = z.object({
	id: z.number(),
	email: z.email(),
	refreshToken: z.string().nullable().default(null).optional(),
});

export const UserCreateSchema = UserSchema.omit({ id: true }).extend({
	password: z.string(),
});
export type UserCreateDtoType = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = UserCreateSchema.partial();
export type UserUpdateDtoType = z.infer<typeof UserUpdateSchema>;
