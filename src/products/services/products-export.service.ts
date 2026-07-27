import { Injectable } from '@nestjs/common';
import * as csv from 'fast-csv';
import { ExportProductsQueryDto } from '../dto/product.dto';
import { CategoriesService } from '@/app/categories/categories.service';
import { PrismaService } from '@/app/prisma/prisma.service';

@Injectable()
export class ProductsExportService {
	constructor(
		private readonly categoriesService: CategoriesService,
		private readonly prismaService: PrismaService,
	) {}

	async exportProductsToCSV(dto: ExportProductsQueryDto): Promise<string> {
		const categoryIds = await this.categoriesService.getDescendantCategoryIdsBySlug(
			dto.categorySlug,
		);

		const products = await this.prismaService.product.findMany({
			where: {
				categoryId:
					categoryIds.length === 1
						? { equals: categoryIds[0] }
						: { in: categoryIds },
			},
			include: {
				params: { include: { key: true, value: true } },
				variants: {
					include: {
						attributes: { include: { key: true, value: true } },
						tags: true,
					},
				},
			},
			orderBy: [{ id: 'asc' }],
		});

		type ExportRow = Record<string, string | number>;
		const baseColumns = [
			'id',
			'sourceId',
			'slug',
			'name',
			'imgUrl',
			'price',
			'tags',
			'isMain',
		];
		const paramColumns = new Set<string>();
		const attributeColumns = new Set<string>();

		for (const product of products) {
			for (const param of product.params) {
				paramColumns.add(`${param.key.value}`);
			}
			for (const variant of product.variants) {
				for (const attribute of variant.attributes) {
					attributeColumns.add(`${attribute.key.value}`);
				}
			}
		}

		const orderedParamColumns = Array.from(paramColumns).sort();
		const orderedAttributeColumns = Array.from(attributeColumns).sort();
		const headers = [
			...baseColumns,
			...orderedParamColumns,
			...orderedAttributeColumns,
		];

		const rows: ExportRow[] = [];

		for (const product of products) {
			const paramsMap = new Map(
				product.params.map((param) => [`${param.key.value}`, param.value.value]),
			);

			for (const variant of product.variants) {
				const row: ExportRow = {
					id: product.id,
					sourceId: variant.sourceId ?? '',
					slug: product.slug,
					name: product.name,
					imgUrl: variant.imgUrl,
					price: variant.price ?? '',
					tags: variant.tags.map((tag) => tag.key).join(','),
					isMain: variant.imgUrl === product.imgUrl ? 'true' : '',
				};

				for (const column of orderedParamColumns) {
					row[column] = paramsMap.get(column) ?? '';
				}

				for (const column of orderedAttributeColumns) {
					row[column] = '';
				}

				for (const attribute of variant.attributes) {
					row[`${attribute.key.value}`] = attribute.value.value;
				}

				rows.push(row);
			}
		}

		return await csv.writeToString(rows, { headers });
	}
}
