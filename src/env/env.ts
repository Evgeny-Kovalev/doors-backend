import { z } from 'zod';

export const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']),
	PORT: z.coerce.number().optional().default(4000),

	DATABASE_URL: z.url(),

	APP_URL: z.url(),

	STATIC_DOCS_PATH: z.string(),
	STATIC_IMAGES_PATH: z.string(),

	STATIC_IMAGES_PATH_API: z.string(),

	SECRET_JWT: z.string(),

	TOKEN_EXPIRES_IN: z.string(),
	AT_SECRET: z.string(),
	RT_SECRET: z.string(),

	TELEGRAM_BOT_TOKEN: z.string(),
	TELEGRAM_CHAT_IDS: z.string(),

	SENTRY_DSN: process.env.NODE_ENV === 'production' ? z.url() : z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;
