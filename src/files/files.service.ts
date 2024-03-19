import { EnvService } from './../env/env.service';
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { createWriteStream, existsSync, unlink } from 'fs';
import { join } from 'path';
import { FileTypeInfoMap, FileTypes } from './types';
import { HttpService } from '@nestjs/axios';
import { join as joinPath } from 'node:path/posix';

@Injectable()
export class FilesService {
	constructor(
		private readonly httpService: HttpService,
		private readonly envService: EnvService,
	) {}

	private getFilesMap() {
		const FILES_MAP: FileTypeInfoMap = {
			DOC: { path: this.envService.get('STATIC_DOCS_PATH') },
			IMG: { path: this.envService.get('STATIC_IMAGES_PATH') },
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

		//TODO
		return { message: 'File has been successfully deleted' };
	}

	async deleteFileByName(imageName: string, fileType: FileTypes) {
		const imagePath = this.getPathToFile(imageName, fileType);
		return await this.deleteFileByPath(imagePath);
	}

	getPathToFile(name: string, fileType: FileTypes) {
		const folderPath = this.getDestinationPathByFileType(fileType);
		const filePath = join(process.cwd(), folderPath, name);

		if (!existsSync(filePath))
			throw new BadRequestException('There is no file with this name');

		return filePath;
	}

	getDestinationPathByFileType(type: FileTypes): string {
		const path = this.getFilesMap()[type].path;
		if (!path)
			throw new InternalServerErrorException(
				`Cannot get destiantion paht to file typeof ${type}`,
			);
		return path;
	}

	isFileExist(name: string, fileType: FileTypes) {
		const folderPath = this.getDestinationPathByFileType(fileType);
		const filePath = join(process.cwd(), folderPath, name);
		return existsSync(filePath);
	}

	async loadFile({
		url,
		fileName,
		outputDir,
	}: {
		url: string;
		fileName: string;
		outputDir: string;
	}) {
		const writer = createWriteStream(join(outputDir, fileName));

		const response = await this.httpService.axiosRef({
			url: url,
			method: 'GET',
			responseType: 'stream',
		});

		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	}

	async loadFileByFileType({
		url,
		fileName,
		type,
	}: {
		url: string;
		fileName: string;
		type: FileTypes;
	}) {
		await this.loadFile({
			url,
			fileName,
			outputDir: this.getDestinationPathByFileType(type),
		});
		return this.getPathToFile(fileName, type);
	}

	async getOrLoadFile({ url, fileType }: { url: string; fileType: FileTypes }) {
		const fileName = url.substring(url.lastIndexOf('/') + 1);

		const isImgExist = this.isFileExist(fileName, fileType);

		if (isImgExist) {
			return this.getPathToFile(fileName, fileType);
		} else {
			const loadedImgPath = await this.loadFileByFileType({
				url,
				fileName,
				type: FileTypes.IMG,
			});
			return loadedImgPath;
		}
	}

	convertImagePathToUrl(path: string) {
		const fileName = path.substring(path.lastIndexOf('/') + 1);
		if (
			!this.envService.get('APP_URL') ||
			!this.envService.get('STATIC_IMAGES_PATH_API')
		)
			throw new InternalServerErrorException();

		const fullUrl = new URL(this.envService.get('APP_URL'));
		fullUrl.pathname = joinPath(
			this.envService.get('STATIC_IMAGES_PATH_API'),
			fileName,
		);

		return fullUrl.toString();
	}
}
