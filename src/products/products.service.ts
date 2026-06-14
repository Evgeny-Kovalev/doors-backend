import { AttributesService } from './modules/attributes/attributes.service';
import { VariantsService } from './modules/variants/variants.service';
import { FilesService } from 'src/files/files.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ImportService } from './services/import.service';
import { groupBy } from 'src/utils';
import { ProductVariantFromFile } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from 'src/categories/categories.service';
import { PaginatedDto, PaginationQueryDto } from 'src/shared/pagination/dto';
import {
	ImportTemplate,
	ProductCreateDto,
	ProductDto,
	ProductImportDto,
	ProductQueryDto,
	ProductUpdateDto,
} from './dto/product.dto';
import slugify from 'slugify';
import { CategoryDto } from '../categories/dto';
import { Prisma } from '@prisma/client';
import { ExportProductsQueryDto } from './dto/product.dto';
import * as csv from 'fast-csv';

const DEFAULT_INCLUDE = {
	category: true,
	params: { include: { key: true, value: true } },
	variants: {
		include: {
			attributes: {
				include: {
					key: true,
					value: true,
				},
			},
			tags: true,
		},
	},
};

@Injectable()
export class ProductsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly filesService: FilesService,
		private readonly categoriesService: CategoriesService,
		private readonly variantsService: VariantsService,
		private readonly importService: ImportService,
		private readonly attributesService: AttributesService,
	) {}

	private readonly logger = new Logger(ProductsService.name);

	async getAll(
		query: ProductQueryDto,
		{ limit, page }: PaginationQueryDto,
	): Promise<PaginatedDto<ProductDto>> {
		try {
			const productFilter = await this.buildProductFilter(query);
			const paginationSkip = (page - 1) * limit;
			const sort = query.sort ?? 'default';
			const order = query.order ?? 'asc';

			// sort=name: алфавит по name -> id; категория и теги не учитываются
			if (sort === 'name') {
				const [products, count] = await this.prismaService.$transaction([
					this.prismaService.product.findMany({
						include: DEFAULT_INCLUDE,
						where: productFilter,
						take: limit,
						skip: paginationSkip,
						orderBy: [{ name: order }, { id: 'asc' }],
					}),
					this.prismaService.product.count({ where: productFilter }),
				]);

				return new PaginatedDto<ProductDto>(products, page, limit, count);
			}

			if (sort === 'price') {
				return await this.getAllSortedByPrice(
					query,
					productFilter,
					order,
					paginationSkip,
					limit,
					page,
				);
			}

			return await this.getAllDefaultSort(
				query,
				productFilter,
				paginationSkip,
				limit,
				page,
			);
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot get products');
		}
	}

	private async buildProductFilter(
		query: ProductQueryDto,
	): Promise<Prisma.ProductWhereInput> {
		const productFilter: Prisma.ProductWhereInput = {};
		if (query?.q) productFilter.name = { contains: query.q, mode: 'insensitive' };
		if (query?.productTypes) productFilter.productType = { in: query.productTypes };
		if (query?.categorySlug) {
			const ids = await this.categoriesService.getDescendantCategoryIdsBySlug(
				query.categorySlug,
			);
			if (ids.length === 1) productFilter.categoryId = { equals: ids[0] };
			else if (ids.length > 1) productFilter.categoryId = { in: ids };
		}
		return productFilter;
	}

	private async buildProductSqlWhere(query: ProductQueryDto): Promise<Prisma.Sql> {
		const conditions: Prisma.Sql[] = [];

		if (query.q) {
			conditions.push(Prisma.sql`p.name ILIKE ${`%${query.q}%`}`);
		}
		if (query.productTypes?.length) {
			conditions.push(
				Prisma.sql`p."productType"::text IN (${Prisma.join(query.productTypes)})`,
			);
		}
		if (query.categorySlug) {
			const ids = await this.categoriesService.getDescendantCategoryIdsBySlug(
				query.categorySlug,
			);
			if (ids.length === 1) {
				conditions.push(Prisma.sql`p."categoryId" = ${ids[0]}`);
			} else if (ids.length > 1) {
				conditions.push(Prisma.sql`p."categoryId" IN (${Prisma.join(ids)})`);
			}
		}

		return conditions.length ? Prisma.join(conditions, ' AND ') : Prisma.sql`TRUE`;
	}

	/**
	 * sort=default: тег -> наличие цены -> category.order -> id.
	 * "Есть цена" = хотя бы один вариант с COALESCE(discountPrice, price).
	 */
	private async getAllDefaultSort(
		query: ProductQueryDto,
		productFilter: Prisma.ProductWhereInput,
		skip: number,
		take: number,
		page: number,
	): Promise<PaginatedDto<ProductDto>> {
		const whereSql = await this.buildProductSqlWhere(query);

		const rows = await this.prismaService.$queryRaw<{ id: number }[]>`
			SELECT p.id
			FROM "Product" p
			LEFT JOIN "Category" c ON c.id = p."categoryId"
			WHERE ${whereSql}
			ORDER BY
				EXISTS (
					SELECT 1
					FROM "ProductVariant" v
					INNER JOIN "_ProductVariantToTag" vt ON vt."A" = v.id
					WHERE v."productId" = p.id
				) DESC,
				EXISTS (
					SELECT 1
					FROM "ProductVariant" v
					WHERE v."productId" = p.id
						AND COALESCE(v."discountPrice", v.price) IS NOT NULL
				) DESC,
				c."order" ASC NULLS LAST,
				p.id ASC
			LIMIT ${take} OFFSET ${skip}
		`;

		const [products, count] = await Promise.all([
			rows.length ? this.findProductsByIdsInOrder(rows.map((row) => row.id)) : [],
			this.prismaService.product.count({ where: productFilter }),
		]);

		return new PaginatedDto<ProductDto>(products, page, take, count);
	}

	/**
	 * sort=price: только min-цена по вариантам (COALESCE(discountPrice, price)), без категории и тегов.
	 * Без цены — в конец (NULLS LAST).
	 */
	private async getAllSortedByPrice(
		query: ProductQueryDto,
		productFilter: Prisma.ProductWhereInput,
		order: 'asc' | 'desc',
		skip: number,
		take: number,
		page: number,
	): Promise<PaginatedDto<ProductDto>> {
		const whereSql = await this.buildProductSqlWhere(query);
		const direction = order === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;

		const rows = await this.prismaService.$queryRaw<{ id: number }[]>`
			SELECT p.id
			FROM "Product" p
			LEFT JOIN LATERAL (
				SELECT MIN(COALESCE(v."discountPrice", v.price)) AS min_price
				FROM "ProductVariant" v
				WHERE v."productId" = p.id
			) prices ON true
			WHERE ${whereSql}
			ORDER BY prices.min_price ${direction} NULLS LAST, p.id ASC
			LIMIT ${take} OFFSET ${skip}
		`;

		const [products, count] = await Promise.all([
			rows.length ? this.findProductsByIdsInOrder(rows.map((row) => row.id)) : [],
			this.prismaService.product.count({ where: productFilter }),
		]);

		return new PaginatedDto<ProductDto>(products, page, take, count);
	}

	private async findProductsByIdsInOrder(ids: number[]) {
		const products = await this.prismaService.product.findMany({
			include: DEFAULT_INCLUDE,
			where: { id: { in: ids } },
		});
		const productsById = new Map(products.map((product) => [product.id, product]));

		return ids.map((id) => productsById.get(id)).filter((product) => product != null);
	}

	async getRandom({
		category,
		limit,
	}: {
		category: CategoryDto;
		limit: number;
	}): Promise<ProductDto[]> {
		try {
			const rows = await this.prismaService.$queryRaw<{ id: number }[]>`
					SELECT id FROM "Product"
					WHERE "categoryId" = ${category.id}
					ORDER BY RANDOM()
					LIMIT ${limit}
				`;

			if (!rows.length) return [];

			const products = await this.prismaService.product.findMany({
				where: { id: { in: rows.map((r) => r.id) } },
				include: DEFAULT_INCLUDE,
			});
			return products;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot get random products');
		}
	}

	async getById(id: number): Promise<ProductDto> {
		const product = await this.prismaService.product.findFirst({
			include: DEFAULT_INCLUDE,
			where: { id },
		});
		if (!product) throw new BadRequestException('Product with this id not found');
		return product;
	}

	async getBySlug(slug: string): Promise<ProductDto> {
		const product = await this.prismaService.product.findFirst({
			include: DEFAULT_INCLUDE,
			where: { slug },
		});
		if (!product) throw new BadRequestException('Product with this slug not found');
		return product;
	}

	async createOne(dto: ProductCreateDto): Promise<ProductDto> {
		try {
			const {
				name,
				categoryId,
				description,
				imgUrl,
				isVisible,
				paramIds,
				productType,
			} = dto;

			const slug = slugify(name, { lower: true });
			const upsertProductData = {
				slug,
				name,
				description,
				imgUrl,
				isVisible,
				productType,
				category: categoryId ? { connect: { id: categoryId } } : undefined,
				params: { connect: paramIds.map((id) => ({ id })) },
			};

			const product: ProductDto = await this.prismaService.product.upsert({
				where: { slug },
				create: upsertProductData,
				update: upsertProductData,
				include: DEFAULT_INCLUDE,
			});
			this.logger.log(`Created product: ${product.name}`);
			return product;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot create product');
		}
	}

	async update(slug: string, dto: ProductUpdateDto): Promise<ProductDto> {
		try {
			const product = await this.getBySlug(slug);
			const {
				name,
				categoryId,
				description,
				imgUrl,
				isVisible,
				paramIds,
				productType,
				price,
				discountPrice,
			} = dto;

			const newParams = paramIds
				? (await this.attributesService.getManyByIds(paramIds)).map(({ id }) => ({
						id,
					}))
				: undefined;

			if (newParams && paramIds && newParams.length !== paramIds.length)
				throw new BadRequestException(
					'Params with these IDs are missing or there are duplicate ID.',
				);

			const updatedProduct: ProductDto = await this.prismaService.product.update({
				where: { id: product.id },
				data: {
					// slug: name && slugify(name, { lower: true }),
					name,
					description,
					imgUrl,
					isVisible,
					productType,
					category: categoryId ? { connect: { id: categoryId } } : undefined,
					params: newParams ? { set: newParams } : undefined,
					variants:
						price || price === null || discountPrice || discountPrice === null
							? {
									updateMany: {
										data: {
											price,
											discountPrice,
										},
										where: {
											productId: product.id,
										},
									},
								}
							: undefined,
				},
				include: DEFAULT_INCLUDE,
			});
			return updatedProduct;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot update product');
		}
	}

	async delete(id: number): Promise<ProductDto> {
		try {
			await this.getById(id);
			return await this.prismaService.product.delete({
				where: { id },
				include: DEFAULT_INCLUDE,
			});
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Product deletion error');
		}
	}

	async importFromFile(
		dto: ProductImportDto,
		{ file }: { file: Express.Multer.File },
	): Promise<ProductDto[]> {
		const GROUP_BY_KEY = 'name';

		const category = await this.categoriesService.getById(dto.categoryId);

		let productsFromFile: ProductVariantFromFile[] = [];

		try {
			productsFromFile =
				await this.importService.parseCsvFile<ProductVariantFromFile>(file);
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('File parse error');
		}
		if (!productsFromFile.length)
			throw new BadRequestException('Invalid or empty file');

		const groupedProducts = groupBy<ProductVariantFromFile>(
			productsFromFile,
			(variant) => {
				if (!variant[GROUP_BY_KEY])
					throw new BadRequestException(
						`The file does not have the attribute '${GROUP_BY_KEY}' for grouping products`,
					);
				return variant[GROUP_BY_KEY];
			},
		);

		const allProducts = Object.values(groupedProducts);

		this.logger.log(
			'Grouped products names:',
			allProducts.map((p) => p[0].name),
		);
		this.logger.log(`Grouped products length: ${allProducts.length}`);

		const createdProducts: ProductDto[] = [];

		for (const [index, productVariants] of allProducts.entries()) {
			const productDto = await this.getProductDtoFromFile(
				productVariants,
				category,
				dto.template,
			);

			const newProduct = await this.createOne({ ...productDto });

			const productVariantsDtos = await this.importService.getVariantDtosFromFile(
				newProduct,
				category,
				productVariants,
				dto.template,
			);

			for (const variantDto of productVariantsDtos) {
				await this.variantsService.createOne(newProduct, variantDto);
			}

			this.logger.log(`${index + 1} / ${allProducts.length} products created.`);

			const createdProduct: ProductDto = await this.getById(newProduct.id);
			createdProducts.push(createdProduct);
		}

		this.logger.log(`Created products length: ${createdProducts.length}`);
		return createdProducts;
	}

	async getProductDtoFromFile(
		productVariantsFromFile: ProductVariantFromFile[],
		category: CategoryDto,
		template: ImportTemplate,
	): Promise<ProductCreateDto> {
		// keys in doc
		const { imgPathKey, nameKey } = template.info;
		// TODO: check for keys in file

		const mainVariant = productVariantsFromFile[0];

		const params = await this.attributesService.getOrCreateMany(
			template.paramsKeysInDoc,
			mainVariant,
			productVariantsFromFile,
		);

		const url = mainVariant[imgPathKey];
		const uploadedImageUrl = await this.filesService.getOrDownloadFile({
			url,
			fileExtensionInS3: '.webp',
			prefix: `category/${category.slug}/doors`,
		});

		const productDto: ProductCreateDto = {
			// TODO: desc
			description: 'test desc',
			categoryId: category.id,
			imgUrl: uploadedImageUrl,
			name: mainVariant[nameKey],
			paramIds: params.map((param) => param.id),
		};
		return productDto;
	}

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
					},
				},
			},
			orderBy: [{ id: 'asc' }],
		});

		type ExportRow = Record<string, string | number>;
		const baseColumns = ['id', 'sourceId', 'slug', 'name', 'imgUrl', 'price'];
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
