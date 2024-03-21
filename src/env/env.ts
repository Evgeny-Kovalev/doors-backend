import { z } from 'zod';

export const envSchema = z.object({
	PORT: z.coerce.number().optional().default(4000),

	DATABASE_URL: z.string().url(),

	APP_URL: z.string().url(),

	STATIC_DOCS_PATH: z.string(),
	STATIC_IMAGES_PATH: z.string(),

	STATIC_IMAGES_PATH_API: z.string(),

	SECRET_JWT: z.string(),

	TOKEN_EXPIRES_IN: z.string(),
	AT_SECRET: z.string(),
	RT_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;
