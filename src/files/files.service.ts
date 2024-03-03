import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { existsSync, unlink } from 'fs';
import { join } from 'path';
import { FileTypeInfoMap, FileTypes } from './types';

@Injectable()
export class FilesService {
	constructor() {}

	private getFilesMap() {
		const FILES_MAP: FileTypeInfoMap = {
			DOC: { path: process.env.STATIC_DOCS_PATH },
			IMG: { path: process.env.STATIC_IMAGES_PATH },
		};
		return FILES_MAP;
	}

	async deleteFileByPath(path: string) {
		if (!existsSync(path)) {
			throw new BadRequestException('There is no file with this name');
		}
		await unlink(path, (err) => {
			if (err) throw new InternalServerErrorException(err);
		});
		return { message: 'File has been successfully deleted' };
	}

	async deleteFileByName(imageName: string, fileType: FileTypes) {
		const imagePath = this.getPathToFile(imageName, fileType);

		return await this.deleteFileByPath(imagePath);
	}

	getPathToFile(name: string, fileType: FileTypes) {
		const folderPath = this.getFilesMap()[fileType].path;

		if (!folderPath) throw new InternalServerErrorException();
		const filePath = join(process.cwd(), folderPath, name);

		if (!existsSync(filePath))
			throw new BadRequestException('There is no file with this name');

		return filePath;
	}
}
