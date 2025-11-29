import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TagsController } from './tags.controller';

@Module({
	providers: [TagsService],
	exports: [TagsService],
	imports: [PrismaModule],
	controllers: [TagsController],
})
export class TagsModule {}
