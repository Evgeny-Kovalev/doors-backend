import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { fileMimetypeFilter } from '../file-mimetype-filter';
import { diskStorage } from 'multer';

function ApiFile(
	fieldName: string = 'file',
	required: boolean = false,
	localOptions?: MulterOptions,
) {
	return applyDecorators(
		UseInterceptors(FileInterceptor(fieldName, localOptions)),
		ApiConsumes('multipart/form-data'),
		ApiBody({
			schema: {
				type: 'object',
				required: required ? [fieldName] : [],
				properties: {
					[fieldName]: {
						type: 'string',
						format: 'binary',
					},
				},
			},
		}),
	);
}

export function ApiImageFile(fileName: string = 'image', required: boolean = true) {
	return ApiFile(fileName, required, {
		fileFilter: fileMimetypeFilter('image'),
		storage: diskStorage({
			destination: './files/images',
			filename: (req, file, cb) => cb(null, file.originalname),
		}),
	});
}

export function ApiCsvFile(fileName: string = 'document', required: boolean = true) {
	return ApiFile(fileName, required, {
		fileFilter: fileMimetypeFilter('text/csv'),
		storage: diskStorage({
			destination: './files/docs',
			filename: (req, file, cb) => cb(null, file.originalname),
		}),
	});
}
