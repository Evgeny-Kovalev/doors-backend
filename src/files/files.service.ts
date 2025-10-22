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

const S3_PREFIX_BY_MIME: Record<string, string> = {
	'image/*': 'doors',
	'text/csv': 'docs',
	'application/csv': 'docs',
};

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
		const appUrl = new URL(this.envService.get('APP_URL'));
		appUrl.pathname = `/${encodeURIComponent(key)}`;

		return appUrl.toString();
	}

	async uploadFileToS3(
		file: Express.Multer.File,
		{ returnOriginalS3Url = false }: { returnOriginalS3Url?: boolean } = {},
	): Promise<{ url: string; key: string }> {
		if (!file?.buffer) throw new BadRequestException('No file buffer');

		const prefix = this.getPrefixForMime(file.mimetype);
		const key = prefix ? `${prefix}/${file.originalname}` : file.originalname;

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
		} catch (error) {
			this.logger.error(error);
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
		} catch (error) {
			this.logger.error(error);
			throw new InternalServerErrorException('Failed to delete file');
		}
	}

	async getOrDownloadFile({ url }: { url: string }): Promise<string> {
		let fileName = '';

		try {
			const parsed = new URL(url);
			const last = parsed.pathname.split('/').pop();
			fileName = last ? decodeURIComponent(last) : '';
		} catch (_) {
			const last = url.split('?')[0].split('#')[0].split('/').pop();
			fileName = last ? decodeURIComponent(last) : '';
		}
		if (!fileName) throw new BadRequestException('Invalid file url');

		const guessedMime = this.guessMimeFromFilename(fileName);
		const prefix = this.getPrefixForMime(guessedMime);
		const s3Key = prefix ? `${prefix}/${fileName}` : fileName;

		try {
			await this.getS3Client().send(
				new HeadObjectCommand({
					Bucket: this.envService.get('S3_BUCKET'),
					Key: s3Key,
				}),
			);
			return this.getS3PublicUrl(s3Key);
		} catch (error) {
			const httpStatus = error?.$metadata?.httpStatusCode;
			const isNotFound = httpStatus === 404 || error?.name === 'NotFound';
			if (!isNotFound)
				this.logger.warn(`HEAD failed for ${s3Key}: ${error?.message ?? error}`);
		}

		try {
			const response = await this.httpService.get<ArrayBuffer>(url, {
				responseType: 'arraybuffer',
				validateStatus: () => true,
			});
			const { data, status, headers } = await firstValueFrom(response);

			if (status >= 400) throw new Error(`Failed to download: ${status}`);

			const contentType =
				headers['content-type'] || guessedMime || 'application/octet-stream';
			await this.getS3Client().send(
				new PutObjectCommand({
					Bucket: this.envService.get('S3_BUCKET'),
					Key: s3Key,
					Body: Buffer.from(data),
					ContentType: contentType,
				}),
			);
			this.logger.log(`File ${s3Key} downloaded and uploaded successfully`);
			return this.getS3PublicUrl(s3Key);
		} catch (error) {
			this.logger.error(error);
			throw new InternalServerErrorException('Failed to fetch and upload file');
		}
	}

	private getPrefixForMime(mimetype?: string): string {
		if (!mimetype) return '';
		for (const [pattern, prefix] of Object.entries(S3_PREFIX_BY_MIME)) {
			if (pattern.endsWith('/*')) {
				const base = pattern.slice(0, -2);
				if (mimetype.startsWith(base + '/')) return prefix;
			} else if (mimetype === pattern) {
				return prefix;
			}
		}
		return '';
	}

	private guessMimeFromFilename(fileName: string): string | undefined {
		const lower = fileName.toLowerCase();
		if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
		if (lower.endsWith('.png')) return 'image/png';
		if (lower.endsWith('.webp')) return 'image/webp';
		if (lower.endsWith('.gif')) return 'image/gif';
		if (lower.endsWith('.svg')) return 'image/svg+xml';
		if (lower.endsWith('.csv')) return 'text/csv';
		return undefined;
	}
}
