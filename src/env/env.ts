import { z } from 'zod';

export const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']),
	PORT: z.coerce.number().optional().default(4000),

	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	DB_HOST: z.string(),
	DATABASE_URL: z.url(),

	APP_URL: z.url(),

	SECRET_JWT: z.string(),

	TOKEN_EXPIRES_IN: z.string(),
	AT_SECRET: z.string(),
	RT_SECRET: z.string(),

	TELEGRAM_BOT_TOKEN: z.string(),
	TELEGRAM_CHAT_IDS: z.string(),

	SENTRY_DSN: process.env.NODE_ENV === 'production' ? z.url() : z.url().optional(),

	S3_BUCKET: z.string(),
	S3_REGION: z.string(),
	S3_ACCESS_KEY_ID: z.string(),
	S3_SECRET_ACCESS_KEY: z.string(),
	S3_ENDPOINT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
