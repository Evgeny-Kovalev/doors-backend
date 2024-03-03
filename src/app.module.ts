import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './products/models/Attribute.entity';
import { Product } from './products/models/Product.entity';
import { ProductVariant } from './products/models/ProductVariant.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		ConfigModule.forRoot({ load: [configuration] }),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('database.host') || 'localhost1',
				port: +configService.get('database.port') || 5432,
				username: configService.get('database.username') || 'postgres1',
				password: configService.get('database.password') || 'postgres1',
				database: configService.get('database.name') || 'postgres1',
				entities: [Product, Attribute, ProductVariant],
				synchronize: true,
			}),
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'files', 'images'),
			serveRoot: '/images',
			exclude: ['/api*'],
		}),
		ProductsModule,
		CategoriesModule,
		FilesModule,
	],
	providers: [],
})
export class AppModule {}
