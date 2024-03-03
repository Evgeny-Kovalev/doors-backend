import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ExceptionsLoggerFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus ? exception.getStatus() : 500;

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			error: exception.message,
		});
	}
}
