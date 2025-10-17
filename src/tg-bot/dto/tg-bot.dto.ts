import { TgBotCallbackSchema, TgBotCallbackResponseSchema } from '../../../contracts';
import { createZodDto } from 'nestjs-zod';

export class TgBotCallbackDto extends createZodDto(TgBotCallbackSchema) {}
export class TgBotCallbackResponseDto extends createZodDto(TgBotCallbackResponseSchema) {}
