import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';

@Module({
	imports: [
		ConfigModule.forRoot({ load: [configuration] }),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'files', 'images'),
			serveRoot: '/images',
			exclude: ['/api*'],
		}),
		ProductsModule,
		CategoriesModule,
		FilesModule,
		PrismaModule,
	],
	providers: [],
})
export class AppModule {}
