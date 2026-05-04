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
			const paginationSkip = (page - 1) * limit;
			const taggedFilter: Prisma.ProductWhereInput = {
				AND: [productFilter, { variants: { some: { tags: { some: {} } } } }],
			};
			const untaggedFilter: Prisma.ProductWhereInput = {
				AND: [productFilter, { variants: { none: { tags: { some: {} } } } }],
			};

			const { products, count } = await this.prismaService.$transaction(async (tx) => {
				const [totalCount, taggedCount] = await Promise.all([
					tx.product.count({ where: productFilter }),
					tx.product.count({ where: taggedFilter }),
				]);

				const taggedTake =
					paginationSkip >= taggedCount
						? 0
						: Math.min(limit, taggedCount - paginationSkip);
				const taggedSkip = taggedTake ? paginationSkip : 0;
				const untaggedSkip =
					paginationSkip > taggedCount ? paginationSkip - taggedCount : 0;
				const untaggedTake = limit - taggedTake;

				const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
					{ category: { order: 'asc' } },
					{ id: 'asc' },
				];

				const taggedProductsPromise = taggedTake
					? tx.product.findMany({
							include: DEFAULT_INCLUDE,
							where: taggedFilter,
							take: taggedTake,
							skip: taggedSkip,
							orderBy,
						})
					: Promise.resolve([]);

				const untaggedProductsPromise = untaggedTake
					? tx.product.findMany({
							include: DEFAULT_INCLUDE,
							where: untaggedFilter,
							take: untaggedTake,
							skip: untaggedSkip,
							orderBy,
						})
					: Promise.resolve([]);

				const [taggedProducts, untaggedProducts] = await Promise.all([
					taggedProductsPromise,
					untaggedProductsPromise,
				]);

				return {
					products: [...taggedProducts, ...untaggedProducts],
					count: totalCount,
				};
			});

			return new PaginatedDto<ProductDto>(products, page, limit, count);
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot get products');
		}
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
				slug: slugify(name, { lower: true }),
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

		for (const productVariants of allProducts) {
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

			await Promise.all(
				productVariantsDtos.map(
					async (variantDto) =>
						await this.variantsService.createOne(newProduct, variantDto),
				),
			);

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
}
