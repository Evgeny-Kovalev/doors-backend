import { applyDecorators, UseInterceptors, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { fileMimetypeFilter } from '../file-mimetype-filter';
import { memoryStorage } from 'multer';

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
		storage: memoryStorage(),
	});
}

export function ApiCsvFile(fileName: string = 'document', required: boolean = true) {
	return ApiFile(fileName, required, {
		fileFilter: fileMimetypeFilter('text/csv', 'application/csv'),
		storage: memoryStorage(),
	});
}

export function ApiUploadFile(fileName: string = 'file', required: boolean = true) {
	return ApiFile(fileName, required, {
		fileFilter: fileMimetypeFilter('image', 'text/csv', 'application/csv'),
		storage: memoryStorage(),
	});
}

export function ApiFileWithBody<TModel extends Type<unknown>>({
	bodyType,
	fileName,
	required,
	mimetype,
}: {
	bodyType: TModel;
	fileName: string;
	required: boolean;
	mimetype: string[];
}) {
	return applyDecorators(
		ApiExtraModels(bodyType),
		UseInterceptors(
			FileInterceptor(fileName, {
				fileFilter: fileMimetypeFilter(...mimetype),
				storage: memoryStorage(),
			}),
		),
		ApiConsumes('multipart/form-data'),
		ApiBody({
			schema: {
				allOf: [
					{ $ref: getSchemaPath(bodyType) },
					{
						type: 'object',
						required: required ? [fileName] : [],
						properties: {
							[fileName]: {
								type: 'string',
								format: 'binary',
							},
						},
					},
				],
			},
		}),
	);
}
