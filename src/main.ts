import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common/enums/version-type.enum';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.setGlobalPrefix('api');
	app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

	const configService = app.get(ConfigService);
	const port = configService.get('port');

	const config = new DocumentBuilder()
		.setTitle('Shop backend')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup(`api/:version/docs`, app, document);

	await app.listen(port);
}
bootstrap();
