import { CategoriesModule } from './../categories/categories.module';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FilesModule } from '@/app/files/files.module';
import { ImportService } from './services/import.service';
import { ProductsQueryService } from './services/products-query.service';
import { ProductsCommandService } from './services/products-command.service';
import { AttributesModule } from '@/app/products/modules/attributes/attributes.module';
import { VariantsModule } from './modules/variants/variants.module';
import { SeoModule } from '@/app/seo/seo.module';
import { TagsModule } from '@/app/tags/tags.module';

@Module({
	controllers: [ProductsController],
	providers: [
		ProductsService,
		ProductsQueryService,
		ProductsCommandService,
		ImportService,
	],
	exports: [ProductsService, ProductsQueryService],
	imports: [
		FilesModule,
		VariantsModule,
		AttributesModule,
		CategoriesModule,
		SeoModule,
		TagsModule,
	],
})
export class ProductsModule {}
