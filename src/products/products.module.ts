import { CategoriesModule } from './../categories/categories.module';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FilesModule } from '@/app/files/files.module';
import { ImportService } from './services/import.service';
import { PrismaModule } from '@/app/prisma/prisma.module';
import { AttributesModule } from '@/app/products/modules/attributes/attributes.module';
import { VariantsModule } from './modules/variants/variants.module';
import { SeoModule } from '@/app/seo/seo.module';

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
		SeoModule,
	],
})
export class ProductsModule {}
