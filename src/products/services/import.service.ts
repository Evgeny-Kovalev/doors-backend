import { Injectable } from '@nestjs/common';
import * as csv from 'fast-csv';
import { ImportTemplate, ProductDto } from '../dto/product.dto';
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
		variantsRows: ProductVariantFromFile[],
		template: ImportTemplate,
	): Promise<VariantCreateDto[]> {
		const productVariantsDtos: VariantCreateDto[] = [];

		//TODO: check keys existing
		const { imgPathKey, priceKey, discountPriceKey } = template.info;

		for (const variant of variantsRows) {
			const attributesToAdd = await this.attributesService.getOrCreateMany(
				template.attributesKeysInDoc,
				variant,
				variantsRows,
			);

			const url = variant[imgPathKey];
			const imgUrl = await this.filesService.getOrDownloadFile({
				url,
				fileExtensionInS3: '.webp',
			});

			const variantResult: VariantCreateDto = {
				imgUrl,
				attributeIds: attributesToAdd.map((a) => a.id),
				price: variant[priceKey] ? parseInt(variant[priceKey]) : undefined,
				productId: product.id,
				discountPrice: variant[discountPriceKey]
					? parseInt(variant[discountPriceKey])
					: undefined,
			};
			productVariantsDtos.push(variantResult);
		}
		return productVariantsDtos;
	}
}
