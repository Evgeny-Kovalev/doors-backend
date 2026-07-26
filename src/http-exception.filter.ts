import {
	Logger,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	ExceptionFilter,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	@SentryExceptionCaptured()
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		if (exception instanceof ZodSerializationException) {
			const zodError = exception.getZodError();
			if (zodError instanceof ZodError) {
				this.logger.error(`ZodSerializationException: ${zodError.message}`);
			}
		} else if (!(exception instanceof HttpException)) {
			this.logger.error(`Unhandled error: ${exception}`);
		} else {
			this.logger.error(`Error: ${exception.message}`);
		}

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const exceptionResponse =
			exception instanceof HttpException
				? exception.getResponse()
				: { message: 'Internal server error', statusCode: status };

		const body =
			typeof exceptionResponse === 'string'
				? { statusCode: status, message: exceptionResponse }
				: exceptionResponse;

		response.status(status).json(body);
	}
}
