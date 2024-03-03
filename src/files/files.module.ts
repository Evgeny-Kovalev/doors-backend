import { FilesService } from './files.service';
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
	providers: [FilesService],
	controllers: [FilesController],
	exports: [FilesService],
	imports: [HttpModule],
})
export class FilesModule {}
