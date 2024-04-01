import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [CollectionsController],
	providers: [CollectionsService],
	imports: [PrismaModule],
})
export class CollectionsModule {}
