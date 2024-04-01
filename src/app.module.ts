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

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: (env) => envSchema.parse(env),
			isGlobal: true,
		}),
		ServeStaticModule.forRootAsync({
			imports: [EnvModule],
			inject: [EnvService],
			useFactory: (envService: EnvService) => [
				{
					rootPath: join(__dirname, '..', 'files', 'images'),
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
	],
	providers: [],
})
export class AppModule {}
