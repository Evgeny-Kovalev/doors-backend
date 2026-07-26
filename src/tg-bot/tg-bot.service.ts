import { HttpService } from '@nestjs/axios';
import {
	BadGatewayException,
	Injectable,
	Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { EnvService } from '@/app/env/env.service';
import { TgBotCallbackDto, TgBotFeedbackDto } from './dto/tg-bot.dto';

type TelegramEndpoint = 'sendMessage';

interface TelegramResponse {
	ok: boolean;
	result?: unknown;
	error_code?: number;
	description?: string;
}

@Injectable()
export class TgBotService {
	private readonly logger = new Logger(TgBotService.name);
	private readonly botToken: string;
	private readonly chatIds: string[];

	constructor(
		private readonly httpService: HttpService,
		private readonly envService: EnvService,
	) {
		this.botToken = this.envService.get('TELEGRAM_BOT_TOKEN');
		this.chatIds = this.envService
			.get('TELEGRAM_CHAT_IDS')
			.split(',')
			.map((id) => id.trim());
	}

	private getUrl(endpoint: TelegramEndpoint): string {
		return `https://api.telegram.org/bot${this.botToken}/${endpoint}`;
	}

	private async sendToChats(text: string): Promise<void> {
		const url = this.getUrl('sendMessage');

		this.logger.log(`Sending Telegram message to ${this.chatIds.length} chat(s)`);

		const responses = await Promise.all(
			this.chatIds.map((chatId) =>
				firstValueFrom(
					this.httpService.post<TelegramResponse>(url, {
						chat_id: chatId,
						text,
					}),
				),
			),
		);

		const failedResponses = responses.filter((response) => !response.data.ok);
		if (failedResponses.length > 0) {
			this.logger.warn(
				`Some Telegram messages failed: ${failedResponses.length}/${responses.length}`,
			);
			throw new BadGatewayException('Failed to deliver Telegram message');
		}
	}

	async sendPhoneNumber({ name, phone, comment }: TgBotCallbackDto): Promise<void> {
		const text = `Новый запрос на звонок: ${phone} ${name}${comment && comment.length > 0 ? '\nКомментарий: ' + comment : ''}`;
		try {
			await this.sendToChats(text);
		} catch (error) {
			this.logger.error('Failed to send callback to Telegram');
			throw error instanceof BadGatewayException
				? error
				: new BadGatewayException('Failed to send callback to Telegram');
		}
	}

	async sendFeedbackData({
		name,
		phone,
		text: content,
	}: TgBotFeedbackDto): Promise<void> {
		const text = `Новый отзыв\n\nИмя: ${name}\nТелефон: ${phone}\n\nОтзыв:\n\n${content}`;
		try {
			await this.sendToChats(text);
		} catch (error) {
			this.logger.error('Failed to send feedback to Telegram');
			throw error instanceof BadGatewayException
				? error
				: new BadGatewayException('Failed to send feedback to Telegram');
		}
	}
}
