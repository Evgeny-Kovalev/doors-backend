import { Logger, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	@SentryExceptionCaptured()
	catch(exception: HttpException, host: ArgumentsHost) {
		if (exception instanceof ZodSerializationException) {
			const zodError = exception.getZodError();
			if (zodError instanceof ZodError) {
				this.logger.error(`ZodSerializationException: ${zodError.message}`);
			}
		} else {
			this.logger.error(`Error: ${exception}`);
		}

		super.catch(exception, host);
	}
}
