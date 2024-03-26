import { Injectable } from '@nestjs/common';
import * as csv from 'fast-csv';
import { VariantCreateDto } from '../modules/variants/variant.dto';
import { ImportTemplate, ProductVariantFromFile } from '../types';
import { FilesService } from 'src/files/files.service';
import { FileTypes } from 'src/files/types';
import { createReadStream } from 'fs';
import { AttributesService } from 'src/products/modules/attributes/attributes.service';
import { ProductDto } from '../dto/product.dto';

@Injectable()
export class ImportService {
	constructor(
		private readonly attributesService: AttributesService,
		private readonly filesService: FilesService,
	) {}

	async parseCsvFile<T>(path: string): Promise<T[]> {
		return new Promise((res, rej) => {
			const results: T[] = [];
			createReadStream(path)
				.pipe(csv.parse({ headers: true }))
				.on('error', (error) => {
					rej(error);
				})
				.on('data', (item) => {
					results.push(item);
				})
				.on('end', () => {
					res(results);
				});
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
			const imgPath = await this.filesService.getOrLoadFile({
				url,
				fileType: FileTypes.IMG,
			});

			const imgUrl = this.filesService.convertImagePathToUrl(imgPath);

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
