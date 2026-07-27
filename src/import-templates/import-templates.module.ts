import { Module } from '@nestjs/common';
import { ImportTemplatesService } from './import-templates.service';
import { ImportTemplatesController } from './import-templates.controller';

@Module({
	providers: [ImportTemplatesService],
	exports: [ImportTemplatesService],
	controllers: [ImportTemplatesController],
})
export class ImportTemplatesModule {}
