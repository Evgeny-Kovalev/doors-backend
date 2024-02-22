import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AttributesService } from './attributes.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './models/Product.entity';
import { VariantsModule } from './variants/variants.module';
import { ProductVariant } from './models/ProductVariant.entity';

@Module({
	controllers: [ProductsController],
	providers: [ProductsService, AttributesService],
	exports: [ProductsService],
	imports: [TypeOrmModule.forFeature([Product, ProductVariant]), VariantsModule],
})
export class ProductsModule {}
