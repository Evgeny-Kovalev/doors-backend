import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AttributesController } from './attributes.controller';

@Module({
	controllers: [AttributesController],
	providers: [AttributesService],
	exports: [AttributesService],
	imports: [PrismaModule],
})
export class AttributesModule {}
