import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SeoModule } from '@/app/seo/seo.module';

@Module({
	providers: [CategoriesService],
	exports: [CategoriesService],
	controllers: [CategoriesController],
	imports: [SeoModule],
})
export class CategoriesModule {}
