import { Controller, Delete, Param, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { ApiCsvFile, ApiImageFile } from './decorators/api-file.decorator';
import { ParseFile } from './pipes/parse-file.pipe';
import { FileTypes } from './types';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiBearerAuth()
@ApiTags('Media Files')
@Controller({ path: 'files', version: '1' })
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Post('images')
	@ApiImageFile()
	async uploadImage(@UploadedFile(ParseFile) file: Express.Multer.File) {
		return file;
	}

	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Delete('images/:name')
	async deleteImage(@Param('name') name: string) {
		return await this.filesService.deleteFileByName(name, FileTypes.IMG);
	}

	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Post('documents')
	@ApiCsvFile()
	async uploadDocument(@UploadedFile(ParseFile) file: Express.Multer.File) {
		return file;
	}

	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Delete('documents/:name')
	async deleteDocument(@Param('name') name: string) {
		return await this.filesService.deleteFileByName(name, FileTypes.DOC);
	}
}
