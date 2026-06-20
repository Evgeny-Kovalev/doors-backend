import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { EnvService } from '@/app/env/env.service';
import { TgBotCallbackDto, TgBotFeedbackDto } from './dto/tg-bot.dto';

type TelegramEndpoint = 'sendMessage' | 'getUpdates' | 'getMe';

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

	async sendPhoneNumber({ name, phone, comment }: TgBotCallbackDto): Promise<void> {
		try {
			const url = this.getUrl('sendMessage');
			const text = `Новый запрос на звонок: ${phone} ${name}${comment && comment.length > 0 ? '\nКомментарий: ' + comment : ''}`;

			this.logger.log(
				`Отправка сообщения в Telegram: ${JSON.stringify({ url, chatIds: this.chatIds, text })}`,
			);

			const responses = await Promise.all(
				this.chatIds.map((chatId) =>
					firstValueFrom(
						this.httpService.post<TelegramResponse>(url, {
							chat_id: chatId,
							text: text,
						}),
					),
				),
			);

			const failedResponses = responses.filter((response) => !response.data.ok);
			if (failedResponses.length > 0) {
				this.logger.warn(
					`Некоторые сообщения не были отправлены: ${JSON.stringify(failedResponses)}`,
				);
			}
		} catch (error) {
			this.logger.error(`Ошибка при отправке сообщения в Telegram: ${error}`);
			throw error;
		}
	}
	async sendFeedbackData({
		name,
		phone,
		text: content,
	}: TgBotFeedbackDto): Promise<void> {
		try {
			const url = this.getUrl('sendMessage');
			const text = `Новый отзыв\n\nИмя: ${name}\nТелефон: ${phone}\n\nОтзыв:\n\n${content}`;

			this.logger.log(
				`Отправка сообщения в Telegram: ${JSON.stringify({ url, chatIds: this.chatIds, text })}`,
			);

			const responses = await Promise.all(
				this.chatIds.map((chatId) =>
					firstValueFrom(
						this.httpService.post<TelegramResponse>(url, {
							chat_id: chatId,
							text: text,
						}),
					),
				),
			);

			const failedResponses = responses.filter((response) => !response.data.ok);
			if (failedResponses.length > 0) {
				this.logger.warn(
					`Некоторые сообщения не были отправлены: ${JSON.stringify(failedResponses)}`,
				);
			}
		} catch (error: unknown) {
			this.logger.error(`Ошибка при отправке сообщения в Telegram: ${error}`);
			throw error;
		}
	}
}
