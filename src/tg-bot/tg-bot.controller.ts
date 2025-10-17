import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { TgBotCallbackDto, TgBotCallbackResponseDto } from './dto/tg-bot.dto';
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
			await this.tgBotService.sendPhoneNumber(body.phone, body.name);
			return { success: true };
		} catch (error) {
			this.logger.error(error);
			return { success: false };
		}
	}
}
