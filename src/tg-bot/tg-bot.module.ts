import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TgBotController } from './tg-bot.controller';
import { TgBotService } from './tg-bot.service';

@Module({
	imports: [HttpModule],
	controllers: [TgBotController],
	providers: [TgBotService],
	exports: [TgBotService],
})
export class TgBotModule {}
