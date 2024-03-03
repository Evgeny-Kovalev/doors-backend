import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { VariantCreateDto } from '../dto/variant.dto';
import { Attribute } from '../models/Attribute.entity';
import { Product } from '../models/Product.entity';
import { ImportTemplate, ProductFromFile } from '../types';
import { AttributesService } from './attributes.service';

@Injectable()
export class ImportService {
	constructor(private readonly attributesService: AttributesService) {}

	async parseCsvFile<T>(path: string): Promise<T[]> {
		return new Promise((res, rej) => {
			const results: T[] = [];
			fs.createReadStream(path)
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

	async getVariantsDtosFileObj(
		product: Product,
		variantsRows: ProductFromFile[],
		template: ImportTemplate,
	): Promise<VariantCreateDto[]> {
		const productVariantsDtos: VariantCreateDto[] = [];

		const { imgPathKey, priceKey, discountPriceKey } = template.info;

		for (const variant of variantsRows) {
			const attributesToAdd: Attribute[] = [];

			for (const attrKey of template.attributesKeysInDoc) {
				if (variant[attrKey] === undefined)
					throw new BadRequestException(
						`There is no attribute '${attrKey}' in file`,
					);
				const valueInDoc = variant[attrKey];

				const isAllEmpty =
					variantsRows.findIndex((v) => v[attrKey] !== '') >= 0 ? false : true;

				if (valueInDoc === '' && isAllEmpty) continue;

				const attribute = await this.attributesService.getOrCreate(
					attrKey,
					valueInDoc,
				);
				attributesToAdd.push(attribute);
			}

			const variantResult: VariantCreateDto = {
				imgPath: variant[imgPathKey],
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
