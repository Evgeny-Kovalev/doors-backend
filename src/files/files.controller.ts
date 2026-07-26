import { Controller, Delete, Param, Post, UploadedFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { ApiUploadFile } from './decorators/api-file.decorator';
import { ParseFile } from './pipes/parse-file.pipe';
import { Admin } from '@/app/auth/decorators/admin.decorator';

@ApiTags('Media Files')
@Controller({ path: 'files', version: '1' })
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Admin()
	@Post('files')
	@ApiUploadFile()
	async uploadFile(@UploadedFile(ParseFile) file: Express.Multer.File) {
		const { key, url } = await this.filesService.uploadFileToS3(file);
		return { url, name: key };
	}

	@Admin()
	@Delete('files/:url')
	async deleteFile(@Param('url') url: string) {
		return await this.filesService.deleteFile(url);
	}
}
