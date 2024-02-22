import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute, AttributeValue } from './products/models/Attribute.entity';
import { Product } from './products/models/Product.entity';
import { ProductVariant } from './products/models/ProductVariant.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
	imports: [
		ConfigModule.forRoot({ load: [configuration] }),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('database.host') || 'localhost',
				port: +configService.get('database.port') || 5432,
				username: (await configService.get('database.username')) || 'postgres',
				password: (await configService.get('database.password')) || 'postgres',
				database: (await configService.get('database.name')) || 'postgres',
				entities: [Product, Attribute, AttributeValue, ProductVariant],
				synchronize: true,
			}),
		}),
		ProductsModule,
		CategoriesModule,
	],
	providers: [],
})
export class AppModule {}
