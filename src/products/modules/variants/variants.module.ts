import { Module, forwardRef } from '@nestjs/common';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AttributesModule } from 'src/products/modules/attributes/attributes.module';
import { ProductsModule } from '../../products.module';

@Module({
	controllers: [VariantsController],
	providers: [VariantsService],
	exports: [VariantsService],
	imports: [PrismaModule, AttributesModule, forwardRef(() => ProductsModule)],
})
export class VariantsModule {}
