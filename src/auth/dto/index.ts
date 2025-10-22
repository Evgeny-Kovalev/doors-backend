import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters long')
		.max(128, 'Password must be at most 128 characters long')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
		.regex(/[0-9]/, 'Password must contain at least one digit'),
});

export class AuthDto extends createZodDto(AuthSchema) {}
