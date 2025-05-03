import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EnvModule } from 'src/env/env.module';
import { TgBotController } from './tg-bot.controller';
import { TgBotService } from './tg-bot.service';

@Module({
	imports: [HttpModule, EnvModule],
	controllers: [TgBotController],
	providers: [TgBotService],
	exports: [TgBotService],
})
export class TgBotModule {}
