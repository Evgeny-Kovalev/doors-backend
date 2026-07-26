import { Module } from '@nestjs/common';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { AttributesModule } from '@/app/products/modules/attributes/attributes.module';
import { FilesModule } from '@/app/files/files.module';

@Module({
	controllers: [VariantsController],
	providers: [VariantsService],
	exports: [VariantsService],
	imports: [AttributesModule, FilesModule],
})
export class VariantsModule {}
