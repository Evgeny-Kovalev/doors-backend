import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { CollectionsModule } from './collections/collections.module';
import { TgBotModule } from './tg-bot/tg-bot.module';
import { TagsModule } from './tags/tags.module';
import { NewsModule } from './news/news.module';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './http-exception.filter';
import { SentryModule } from '@sentry/nestjs/setup';
import { SeoModule } from './seo/seo.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

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
		EnvModule,
		ThrottlerModule.forRoot([
			{
				ttl: 60_000,
				limit: 120,
			},
		]),
		ProductsModule,
		CategoriesModule,
		FilesModule,
		PrismaModule,
		AuthModule,
		CollectionsModule,
		TgBotModule,
		TagsModule,
		NewsModule,
		SeoModule,
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
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
