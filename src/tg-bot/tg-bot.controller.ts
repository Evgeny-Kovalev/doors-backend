import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/app/auth/decorators/public.decorator';
import {
	TgBotCallbackDto,
	TgBotCallbackResponseDto,
	TgBotFeedbackDto,
	TgBotFeedbackResponseDto,
} from './dto/tg-bot.dto';
import { TgBotService } from './tg-bot.service';

@ApiTags('Telegram Bot')
@Controller({
	version: '1',
})
export class TgBotController {
	constructor(private readonly tgBotService: TgBotService) {}

	@Public()
	@Throttle({ default: { limit: 5, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	@ApiBody({ type: TgBotCallbackDto })
	@ApiOkResponse({ type: TgBotCallbackResponseDto })
	@Post('callback')
	async callback(@Body() body: TgBotCallbackDto): Promise<TgBotCallbackResponseDto> {
		await this.tgBotService.sendPhoneNumber(body);
		return { success: true };
	}

	@Public()
	@Throttle({ default: { limit: 5, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	@ApiBody({ type: TgBotFeedbackDto })
	@ApiOkResponse({ type: TgBotFeedbackResponseDto })
	@Post('feedback')
	async feedback(@Body() body: TgBotFeedbackDto): Promise<TgBotFeedbackResponseDto> {
		await this.tgBotService.sendFeedbackData(body);
		return { success: true };
	}
}
