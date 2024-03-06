import { CategoriesModule } from './../categories/categories.module';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FilesModule } from 'src/files/files.module';
import { ImportService } from './services/import.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AttributesModule } from 'src/products/modules/attributes/attributes.module';
import { VariantsModule } from './modules/variants/variants.module';

@Module({
	controllers: [ProductsController],
	providers: [ProductsService, ImportService],
	exports: [ProductsService],
	imports: [
		PrismaModule,
		FilesModule,
		VariantsModule,
		AttributesModule,
		CategoriesModule,
	],
})
export class ProductsModule {}
