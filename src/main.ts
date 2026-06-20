import './instrument';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from './env/env.service';
import { VersioningType } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston.logger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	app.setGlobalPrefix('api');
	app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

	const envService = app.get(EnvService);
	const port = envService.get('PORT');
	const isProd = envService.get('NODE_ENV') === 'production';

	const corsOrigins = envService.get('CORS_ORIGINS');

	app.enableCors({
		origin: corsOrigins,
		methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
		allowedHeaders: 'Content-Type, Authorization',
		credentials: true,
		maxAge: 86400,
	});

	app.useLogger(
		isProd
			? WinstonModule.createLogger({
					instance: winstonLogger,
				})
			: new Logger(bootstrap.name),
	);
	const config = new DocumentBuilder()
		.setTitle('Shop backend')
		.setVersion('1.0')
		.addBearerAuth()
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Provide refresh token as Bearer <token>',
			},
			'refresh',
		)
		.build();
	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup(`api/:version/docs`, app, cleanupOpenApiDoc(document));

	await app.listen(port);
}
bootstrap();
