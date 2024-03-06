import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	providers: [AttributesService],
	exports: [AttributesService],
	imports: [PrismaModule],
})
export class AttributesModule {}
