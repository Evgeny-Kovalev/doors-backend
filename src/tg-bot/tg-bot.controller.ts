import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { TgBotCallbackDto } from './dto/tg-bot.dto';
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
	@Post('callback')
	async callback(@Body() body: TgBotCallbackDto) {
		try {
			await this.tgBotService.sendPhoneNumber(body.phone, body.name);
			return { success: true };
		} catch (error) {
			this.logger.error(error);
			return { success: false };
		}
	}
}
