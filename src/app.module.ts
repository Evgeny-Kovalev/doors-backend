import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { EnvService } from './env/env.service';
import { CollectionsModule } from './collections/collections.module';
import { TgBotModule } from './tg-bot/tg-bot.module';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './http-exception.filter';
import { SentryModule } from '@sentry/nestjs/setup';

@Module({
	imports: [
		SentryModule.forRoot(),
		ConfigModule.forRoot({
			validate: (env) => envSchema.parse(env),
			envFilePath: [
				process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : undefined,
				'.env',
			].filter(Boolean) as string[],
			isGlobal: true,
		}),
		ServeStaticModule.forRootAsync({
			imports: [EnvModule],
			inject: [EnvService],
			useFactory: (envService: EnvService) => [
				{
					rootPath: join(__dirname, '..', '..', 'files', 'images'),
					serveRoot: envService.get('STATIC_IMAGES_PATH_API'),
					exclude: ['/api*'],
				},
			],
		}),
		ProductsModule,
		CategoriesModule,
		FilesModule,
		PrismaModule,
		AuthModule,
		CollectionsModule,
		TgBotModule,
	],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ZodSerializerInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
	],
})
export class AppModule {}
