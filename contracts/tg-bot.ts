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

// FEEDBACK

export const TgBotFeedbackSchema = TgBotCallbackSchema.extend({
	text: z.string().min(5),
}).meta({
	title: 'Telegram Bot feedback request',
});

export type TgBotFeedback = z.infer<typeof TgBotFeedbackSchema>;

export const TgBotFeedbackResponseSchema = TgBotCallbackResponseSchema.meta({
	title: 'Telegram Bot feedback response',
});

export type TgBotFeedbackResponse = z.infer<typeof TgBotFeedbackResponseSchema>;
