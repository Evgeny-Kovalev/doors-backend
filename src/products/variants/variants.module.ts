import { Module, forwardRef } from '@nestjs/common';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '../models/ProductVariant.entity';
import { Attribute } from '../models/Attribute.entity';
import { ProductsModule } from '../products.module';

@Module({
	controllers: [VariantsController],
	providers: [VariantsService],
	exports: [VariantsService],
	imports: [
		TypeOrmModule.forFeature([ProductVariant, Attribute]),
		forwardRef(() => ProductsModule),
	],
})
export class VariantsModule {}
