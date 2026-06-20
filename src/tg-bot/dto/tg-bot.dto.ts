import {
	TgBotCallbackSchema,
	TgBotCallbackResponseSchema,
	TgBotFeedbackSchema,
	TgBotFeedbackResponseSchema,
} from '@/contracts';
import { createZodDto } from '@/app/shared/create-zod-dto';

export class TgBotCallbackDto extends createZodDto(TgBotCallbackSchema) {}
export class TgBotCallbackResponseDto extends createZodDto(TgBotCallbackResponseSchema) {}

export class TgBotFeedbackDto extends createZodDto(TgBotFeedbackSchema) {}
export class TgBotFeedbackResponseDto extends createZodDto(TgBotFeedbackResponseSchema) {}
