import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from './env/env.service';
import { VersioningType } from '@nestjs/common/enums/version-type.enum';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston.logger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: true,
		logger: WinstonModule.createLogger({
			instance: winstonLogger,
		}),
		bufferLogs: true,
	});

	app.setGlobalPrefix('api');
	app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

	const envService = app.get(EnvService);
	const port = envService.get('PORT');

	const config = new DocumentBuilder()
		.setTitle('Shop backend')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup(`api/:version/docs`, app, cleanupOpenApiDoc(document));

	await app.listen(port);
}
bootstrap();
