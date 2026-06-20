import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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

	private readonly logger = new Logger(TgBotController.name);

	@Public()
	@ApiBody({ type: TgBotCallbackDto })
	@ApiOkResponse({ type: TgBotCallbackResponseDto })
	@Post('callback')
	async callback(@Body() body: TgBotCallbackDto): Promise<TgBotCallbackResponseDto> {
		try {
			await this.tgBotService.sendPhoneNumber(body);
			return { success: true };
		} catch (error) {
			this.logger.error(error);
			return { success: false };
		}
	}

	@Public()
	@ApiBody({ type: TgBotFeedbackDto })
	@ApiOkResponse({ type: TgBotFeedbackResponseDto })
	@Post('feedback')
	async feedback(@Body() body: TgBotFeedbackDto): Promise<TgBotFeedbackResponseDto> {
		try {
			await this.tgBotService.sendFeedbackData(body);
			return { success: true };
		} catch (error) {
			this.logger.error(error);
			return { success: false };
		}
	}
}
