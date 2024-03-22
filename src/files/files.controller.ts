import { Controller, Delete, Param, Post, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { ApiCsvFile, ApiImageFile } from './decorators/api-file.decorator';
import { ParseFile } from './pipes/parse-file.pipe';
import { FileTypes } from './types';

@ApiBearerAuth()
@ApiTags('Media Files')
@Controller({ path: 'files', version: '1' })
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('images')
	@ApiImageFile()
	async uploadImage(@UploadedFile(ParseFile) file: Express.Multer.File) {
		return file;
	}

	@Delete('images/:name')
	async deleteImage(@Param('name') name: string) {
		return await this.filesService.deleteFileByName(name, FileTypes.IMG);
	}

	@Post('documents')
	@ApiCsvFile()
	async uploadDocument(@UploadedFile(ParseFile) file: Express.Multer.File) {
		return file;
	}

	@Delete('documents/:name')
	async deleteDocument(@Param('name') name: string) {
		return await this.filesService.deleteFileByName(name, FileTypes.DOC);
	}
}
