import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'fast-csv';
import { ImportTemplate, ProductDto } from '../dto/product.dto';
import { CategoryDto } from '../../categories/dto';
import { ProductVariantFromFile } from '../types';
import { FilesService } from 'src/files/files.service';
import { AttributesService } from 'src/products/modules/attributes/attributes.service';
import { VariantCreateDto } from '../modules/variants/variant.dto';
import { Readable } from 'stream';

@Injectable()
export class ImportService {
	constructor(
		private readonly attributesService: AttributesService,
		private readonly filesService: FilesService,
	) {}

	private readonly logger = new Logger(ImportService.name);

	async parseCsvFile<T>(file: Express.Multer.File): Promise<T[]> {
		const source = Readable.from(file.buffer);

		return new Promise((resolve, reject) => {
			const results: T[] = [];
			source
				.pipe(
					csv.parse({
						headers: true,
						ignoreEmpty: true,
					}),
				)
				.on('error', (error) => reject(error))
				.on('data', (row) => {
					results.push(row);
				})
				.on('end', () => resolve(results));
		});
	}

	async getVariantDtosFromFile(
		product: ProductDto,
		category: CategoryDto,
		variantsRows: ProductVariantFromFile[],
		template: ImportTemplate,
	): Promise<VariantCreateDto[]> {
		const productVariantsDtos: VariantCreateDto[] = [];

		//TODO: check keys existing
		const { imgPathKey, priceKey, discountPriceKey, sourceIdKey } = template.info;

		for (const [index, variantRow] of variantsRows.entries()) {
			const attributesToAdd = await this.attributesService.getOrCreateMany(
				template.attributesKeysInDoc,
				variantRow,
				variantsRows,
			);

			const url = variantRow[imgPathKey];
			const imgUrl = await this.filesService.getOrDownloadFile({
				url,
				fileExtensionInS3: '.webp',
				prefix: `category/${category.slug}/doors`,
			});

			this.logger.log(`${index + 1} / ${variantsRows.length} images downloaded`);

			const variantResult: VariantCreateDto = {
				imgUrl,
				sourceId: variantRow[sourceIdKey],
				attributeIds: attributesToAdd.map((a) => a.id),
				price: variantRow[priceKey] ? parseInt(variantRow[priceKey]) : undefined,
				productId: product.id,
				discountPrice: variantRow[discountPriceKey]
					? parseInt(variantRow[discountPriceKey])
					: undefined,
				tags: [],
			};
			productVariantsDtos.push(variantResult);
		}
		return productVariantsDtos;
	}
}
