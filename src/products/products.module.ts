import { CategoriesModule } from './../categories/categories.module';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FilesModule } from '@/app/files/files.module';
import { ProductsImportService } from './services/products-import.service';
import { ProductsExportService } from './services/products-export.service';
import { ProductsQueryService } from './services/products-query.service';
import { ProductsCommandService } from './services/products-command.service';
import { AttributesModule } from '@/app/products/modules/attributes/attributes.module';
import { VariantsModule } from './modules/variants/variants.module';
import { SeoModule } from '@/app/seo/seo.module';
import { TagsModule } from '@/app/tags/tags.module';
import { ImportTemplatesModule } from '@/app/import-templates/import-templates.module';

@Module({
	controllers: [ProductsController],
	providers: [
		ProductsService,
		ProductsQueryService,
		ProductsCommandService,
		ProductsImportService,
		ProductsExportService,
	],
	exports: [ProductsService, ProductsQueryService],
	imports: [
		FilesModule,
		VariantsModule,
		AttributesModule,
		CategoriesModule,
		SeoModule,
		TagsModule,
		ImportTemplatesModule,
	],
})
export class ProductsModule {}
