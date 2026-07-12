import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from '@/app/prisma/prisma.module';
import { SeoModule } from '@/app/seo/seo.module';

@Module({
	providers: [CategoriesService],
	exports: [CategoriesService],
	controllers: [CategoriesController],
	imports: [PrismaModule, SeoModule],
})
export class CategoriesModule {}
