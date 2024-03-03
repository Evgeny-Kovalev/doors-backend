import { FilesService } from './files.service';
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';

@Module({
	providers: [FilesService],
	controllers: [FilesController],
	exports: [FilesService],
})
export class FilesModule {}
