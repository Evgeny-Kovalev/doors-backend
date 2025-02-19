import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserSchema = z.object({
	id: z.number(),
	email: z.string().email(),
	refreshToken: z.string().nullable().default(null).optional(),
});

const UserCreateSchema = UserSchema.omit({ id: true }).extend({
	password: z.string(),
});

const UserUpdateSchema = UserCreateSchema.partial();

export type UserCreateDtoType = z.infer<typeof UserCreateSchema>;
export type UserUpdateDtoType = z.infer<typeof UserUpdateSchema>;

export class UserDto extends createZodDto(UserSchema) {}
export class UserCreateDto extends createZodDto(UserCreateSchema) {}
export class UserUpdateDto extends createZodDto(UserUpdateSchema) {}
