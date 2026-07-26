import { Controller, Delete, Param, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { ApiUploadFile } from './decorators/api-file.decorator';
import { ParseFile } from './pipes/parse-file.pipe';
import { HasRoles } from '../auth/decorators/has-roles.decorator';
import { Role } from '@/app/generated/prisma';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Media Files')
@ApiBearerAuth()
@Controller({ path: 'files', version: '1' })
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Post('files')
	@ApiUploadFile()
	async uploadFile(@UploadedFile(ParseFile) file: Express.Multer.File) {
		const { key, url } = await this.filesService.uploadFileToS3(file);
		return { url, name: key };
	}

	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Delete('files/:url')
	async deleteFile(@Param('url') url: string) {
		return await this.filesService.deleteFile(url);
	}
}
