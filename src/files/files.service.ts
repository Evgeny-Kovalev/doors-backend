import { EnvService } from './../env/env.service';
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
	getS3ErrorMessage,
	isS3ObjectMissing,
	isS3ServiceException,
} from './utils/s3-errors';

@Injectable()
export class FilesService {
	constructor(
		private readonly envService: EnvService,
		private readonly httpService: HttpService,
	) {}

	private s3Client: S3Client | null = null;
	private readonly logger = new Logger(FilesService.name);

	private getS3Client(): S3Client {
		if (this.s3Client) return this.s3Client;

		const region = this.envService.get('S3_REGION');
		const endpoint = this.envService.get('S3_ENDPOINT');

		this.s3Client = new S3Client({
			region,
			credentials: {
				accessKeyId: this.envService.get('S3_ACCESS_KEY_ID'),
				secretAccessKey: this.envService.get('S3_SECRET_ACCESS_KEY'),
			},
			endpoint: endpoint || undefined,
		});

		return this.s3Client;
	}

	private getS3PublicUrl(
		key: string,
		{ returnOriginalS3Url = false }: { returnOriginalS3Url?: boolean } = {},
	): string {
		if (returnOriginalS3Url) {
			return `${this.envService.get('S3_ENDPOINT')}/${this.envService.get('S3_BUCKET')}/${key}`;
		}
		const appFilesUrl = this.envService.get('APP_FILES_URL');
		return `${appFilesUrl}/${encodeURIComponent(key)}`;
	}

	async uploadFileToS3(
		file: Express.Multer.File,
		{
			returnOriginalS3Url = false,
			prefix,
			fileName,
		}: { returnOriginalS3Url?: boolean; prefix?: string; fileName?: string } = {},
	): Promise<{ url: string; key: string }> {
		if (!file?.buffer) throw new BadRequestException('No file buffer');

		const fileNameToUse = fileName ?? file.originalname;
		const key = prefix ? `${prefix}/${fileNameToUse}` : fileNameToUse;

		try {
			await this.getS3Client().send(
				new PutObjectCommand({
					Bucket: this.envService.get('S3_BUCKET'),
					Key: key,
					Body: file.buffer,
					ContentType: file.mimetype,
				}),
			);
			return { url: this.getS3PublicUrl(key, { returnOriginalS3Url }), key };
		} catch (error: unknown) {
			this.logS3Error('Upload file Error', error);
			throw new InternalServerErrorException('Failed to upload file');
		}
	}

	async deleteFile(key: string) {
		try {
			await this.getS3Client().send(
				new DeleteObjectCommand({
					Bucket: this.envService.get('S3_BUCKET'),
					Key: key,
				}),
			);
			return { message: 'File has been successfully deleted' };
		} catch (error: unknown) {
			this.logS3Error('Delete file Error', error);
			throw new InternalServerErrorException('Failed to delete file');
		}
	}

	async getOrDownloadFile({
		url,
		fileExtensionInS3,
		prefix,
	}: {
		url: string;
		fileExtensionInS3?: '.webp';
		prefix: string;
	}): Promise<string> {
		let fileNameFull = '';

		try {
			const parsed = new URL(url);
			const last = parsed.pathname.split('/').pop();
			fileNameFull = last ? decodeURIComponent(last) : '';
		} catch (_) {
			const last = url.split('?')[0].split('#')[0].split('/').pop();
			fileNameFull = last ? decodeURIComponent(last) : '';
		}

		if (!fileNameFull) throw new BadRequestException('Invalid file url');

		const fileName = fileNameFull.split('.')[0];
		const s3Key = prefix
			? `${prefix}/${fileName}${fileExtensionInS3}`
			: `${fileName}${fileExtensionInS3}`;

		try {
			await this.getS3Client().send(
				new HeadObjectCommand({
					Bucket: this.envService.get('S3_BUCKET'),
					Key: s3Key,
				}),
			);
			this.logger.log(`FILE with key "${s3Key}" EXISTS`);
			return this.getS3PublicUrl(s3Key);
		} catch (error: unknown) {
			if (!isS3ObjectMissing(error))
				this.logger.warn(`HEAD failed for ${s3Key}: ${getS3ErrorMessage(error)}`);
		}

		this.logger.log(
			`FILE with key "${s3Key}" DOES NOT EXIST. Trying to download file from URL: ${url}`,
		);
		try {
			const response = await this.httpService.get<ArrayBuffer>(url, {
				responseType: 'arraybuffer',
				validateStatus: () => true,
			});
			const { data, status, headers } = await firstValueFrom(response);

			if (status >= 400) throw new Error(`Failed to download: ${status}`);

			const contentTypeHeader = headers['content-type'];
			const contentType =
				typeof contentTypeHeader === 'string'
					? contentTypeHeader
					: 'application/octet-stream';
			await this.getS3Client().send(
				new PutObjectCommand({
					Bucket: this.envService.get('S3_BUCKET'),
					Key: s3Key,
					Body: Buffer.from(data),
					ContentType: contentType,
				}),
			);
			this.logger.log(`File ${s3Key} downloaded and uploaded to S3 successfully`);
			return this.getS3PublicUrl(s3Key);
		} catch (error: unknown) {
			this.logS3Error('Fetch and upload file Error', error);
			throw new InternalServerErrorException('Failed to fetch and upload file');
		}
	}

	private logS3Error(action: string, error: unknown): void {
		if (isS3ServiceException(error)) {
			this.logger.error(
				`S3 ${action} failed: ${getS3ErrorMessage(error)}`,
				error.stack,
			);
			return;
		}
		this.logger.error(`S3 ${action} failed`, error);
	}
}
