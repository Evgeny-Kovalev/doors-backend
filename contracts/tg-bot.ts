import z from 'zod';

export const TgBotCallbackSchema = z
	.object({
		phone: z.string(),
		name: z.string().min(1).max(50),
	})
	.meta({
		title: 'Telegram Bot callback request',
	});

export type TgBotCallback = z.infer<typeof TgBotCallbackSchema>;

export const TgBotCallbackResponseSchema = z
	.object({
		success: z.boolean(),
	})
	.meta({
		title: 'Telegram Bot callback response',
	});

export type TgBotCallbackResponse = z.infer<typeof TgBotCallbackResponseSchema>;
