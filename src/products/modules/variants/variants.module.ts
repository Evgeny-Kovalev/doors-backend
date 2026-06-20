import { Module, forwardRef } from '@nestjs/common';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { PrismaModule } from '@/app/prisma/prisma.module';
import { AttributesModule } from '@/app/products/modules/attributes/attributes.module';
import { ProductsModule } from '../../products.module';

@Module({
	controllers: [VariantsController],
	providers: [VariantsService],
	exports: [VariantsService],
	imports: [PrismaModule, AttributesModule, forwardRef(() => ProductsModule)],
})
export class VariantsModule {}
