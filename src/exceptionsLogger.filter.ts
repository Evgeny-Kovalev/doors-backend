import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class ExceptionsLoggerFilter implements ExceptionFilter {
	private readonly logger = new Logger(ExceptionsLoggerFilter.name);

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus ? exception.getStatus() : 500;

		if (exception instanceof ZodValidationException) {
			const zodError = exception.getZodError();
			this.logger.error(`ZodValidationException: ${zodError.message}`);
		}

		this.logger.error(`Error: ${exception}`);

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			error: exception.message,
		});
	}
}
