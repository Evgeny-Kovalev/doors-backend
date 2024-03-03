import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AttributesService } from './services/attributes.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './models/Product.entity';
import { VariantsModule } from './variants/variants.module';
import { ProductVariant } from './models/ProductVariant.entity';
import { FilesModule } from 'src/files/files.module';
import { ImportService } from './services/import.service';
import { Attribute } from './models/Attribute.entity';

@Module({
	controllers: [ProductsController],
	providers: [ProductsService, AttributesService, ImportService],
	exports: [ProductsService],
	imports: [
		TypeOrmModule.forFeature([Product, ProductVariant, Attribute]),
		VariantsModule,
		FilesModule,
	],
})
export class ProductsModule {}
