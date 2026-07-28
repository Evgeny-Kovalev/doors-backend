import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as csv from 'fast-csv';
import { ProductDto, ProductCreateDto, ProductImportDto } from '../dto/product.dto';
import { CategoryDto } from '../../categories/dto';
import { ProductVariantFromFile } from '../types';
import { FilesService } from '@/app/files/files.service';
import { AttributesService } from '@/app/products/modules/attributes/attributes.service';
import { VariantCreateDto } from '../modules/variants/variant.dto';
import { Readable } from 'stream';
import { CategoriesService } from '@/app/categories/categories.service';
import { VariantsService } from '../modules/variants/variants.service';
import { ProductsCommandService } from './products-command.service';
import { ProductsQueryService } from './products-query.service';
import { PrismaService } from '@/app/prisma/prisma.service';
import { TagsService } from '@/app/tags/tags.service';
import { ImportTemplatesService } from '@/app/import-templates/import-templates.service';
import { groupBy, mapWithConcurrency } from '@/app/utils';
import type { ImportTemplateConfig } from '@/contracts';

const VARIANT_CREATE_CONCURRENCY = 5;

@Injectable()
export class ProductsImportService {
	constructor(
		private readonly attributesService: AttributesService,
		private readonly filesService: FilesService,
		private readonly categoriesService: CategoriesService,
		private readonly variantsService: VariantsService,
		private readonly productsCommandService: ProductsCommandService,
		private readonly productsQueryService: ProductsQueryService,
		private readonly prismaService: PrismaService,
		private readonly tagsService: TagsService,
		private readonly importTemplatesService: ImportTemplatesService,
	) {}

	private readonly logger = new Logger(ProductsImportService.name);

	async importFromFile(
		dto: ProductImportDto,
		{ file }: { file: Express.Multer.File },
	): Promise<ProductDto[]> {
		const GROUP_BY_KEY = 'name';

		const fallbackCategory = await this.categoriesService.getById(dto.categoryId);
		const template = await this.importTemplatesService.getConfigByTemplateId(
			dto.templateId,
		);

		let productsFromFile: ProductVariantFromFile[] = [];

		try {
			productsFromFile = await this.parseCsvFile<ProductVariantFromFile>(file);
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

		for (const [index, productVariantsFromFile] of allProducts.entries()) {
			const mainVariantIndex = this.getMainVariantRowIndex(
				productVariantsFromFile,
				template,
			);

			const category = await this.resolveCategory({
				fallbackCategory,
				productVariantsFromFile,
				mainVariantIndex,
				template,
			});

			const productDto = await this.getProductDtoFromFile({
				productVariantsFromFile,
				category,
				template,
				mainVariantIndex,
			});

			const createdProduct = await this.productsCommandService.createOne({
				...productDto,
			});

			const productVariantsDtos = await this.getVariantDtosFromFile({
				product: createdProduct,
				category,
				productVariantsFromFile,
				template,
			});

			await mapWithConcurrency(
				productVariantsDtos,
				VARIANT_CREATE_CONCURRENCY,
				(variantDto) => this.variantsService.createOne(createdProduct.id, variantDto),
			);

			const mainVariantImgUrl = productVariantsDtos[mainVariantIndex]?.imgUrl;
			if (mainVariantImgUrl && mainVariantImgUrl !== createdProduct.imgUrl) {
				await this.prismaService.product.update({
					where: { id: createdProduct.id },
					data: { imgUrl: mainVariantImgUrl },
				});
			}

			const productWithVariants = await this.productsQueryService.getById(
				createdProduct.id,
			);

			this.logger.log(`${index + 1} / ${allProducts.length} products created.`);
			createdProducts.push(productWithVariants);
		}

		this.logger.log(`Created products length: ${createdProducts.length}`);
		return createdProducts;
	}

	private async resolveCategory({
		fallbackCategory,
		productVariantsFromFile,
		mainVariantIndex,
		template,
	}: {
		fallbackCategory: CategoryDto;
		productVariantsFromFile: ProductVariantFromFile[];
		mainVariantIndex: number;
		template: ImportTemplateConfig;
	}): Promise<CategoryDto> {
		const categoryBySlug = new Map<string, CategoryDto | null>();

		const mainVariant =
			productVariantsFromFile[mainVariantIndex] ?? productVariantsFromFile[0];
		const categorySlugKey = template.info.categorySlugKey;
		if (!categorySlugKey) return fallbackCategory;

		const slug = mainVariant?.[categorySlugKey]?.trim();
		if (!slug) return fallbackCategory;

		if (categoryBySlug.has(slug)) {
			return categoryBySlug.get(slug) ?? fallbackCategory;
		}

		const found = await this.prismaService.category.findFirst({
			where: { slug },
		});
		categoryBySlug.set(slug, found);

		if (!found) {
			this.logger.warn(
				`Category slug "${slug}" not found, using fallback categoryId=${fallbackCategory.id}`,
			);
			return fallbackCategory;
		}

		return found;
	}

	private parseTagKeys(raw: string | undefined): string[] {
		if (!raw?.trim()) return [];
		return raw
			.split(',')
			.map((key) => key.trim())
			.filter(Boolean);
	}

	private isMainValue(raw: string | undefined): boolean {
		if (!raw?.trim()) return false;
		const value = raw.trim().toLowerCase();
		return value === '1' || value === 'true' || value === 'yes' || value === 'y';
	}

	private getMainVariantRowIndex(
		variantsRows: ProductVariantFromFile[],
		template: ImportTemplateConfig,
	): number {
		const { isMainKey } = template.info;
		if (!isMainKey) return 0;

		const mainIndex = variantsRows.findIndex((row) => this.isMainValue(row[isMainKey]));
		return mainIndex >= 0 ? mainIndex : 0;
	}

	private async parseCsvFile<T>(file: Express.Multer.File): Promise<T[]> {
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

	private async getVariantDtosFromFile({
		product,
		category,
		productVariantsFromFile,
		template,
	}: {
		product: ProductDto;
		category: CategoryDto;
		productVariantsFromFile: ProductVariantFromFile[];
		template: ImportTemplateConfig;
	}): Promise<VariantCreateDto[]> {
		const productVariantsDtos: VariantCreateDto[] = [];

		//TODO: check keys existing
		const {
			imgPathKey,
			imgFrontKey,
			imgBackKey,
			priceKey,
			discountPriceKey,
			sourceIdKey,
			tagsKey,
		} = template.info;

		for (const [index, variantRow] of productVariantsFromFile.entries()) {
			const attributesToAdd = await this.attributesService.getOrCreateMany(
				template.attributesKeysInDoc,
				variantRow,
				productVariantsFromFile,
			);

			const url = variantRow[imgPathKey];
			const imgFrontData = imgFrontKey && variantRow[imgFrontKey];
			const imgBackData = imgBackKey && variantRow[imgBackKey];

			const [imgUrl, imgFrontUrl, imgBackUrl] = await Promise.all([
				this.filesService.getOrDownloadFile({
					url,
					fileExtensionInS3: '.webp',
					prefix: `category/${category.slug}/doors`,
				}),
				imgFrontData &&
					this.filesService.getOrDownloadFile({
						url: imgFrontData,
						fileExtensionInS3: '.webp',
						prefix: `category/${category.slug}/doors`,
					}),
				imgBackData &&
					this.filesService.getOrDownloadFile({
						url: imgBackData,
						fileExtensionInS3: '.webp',
						prefix: `category/${category.slug}/doors`,
					}),
			]);

			this.logger.log(
				`${index + 1} / ${productVariantsFromFile.length} images downloaded`,
			);

			const tagKeys = tagsKey ? this.parseTagKeys(variantRow[tagsKey]) : [];
			const tags = tagKeys.length
				? await this.tagsService.findManyByKeys(tagKeys)
				: [];

			const variantResult: VariantCreateDto = {
				imgUrl,
				imgFrontUrl,
				imgBackUrl,
				sourceId: variantRow[sourceIdKey],
				attributeIds: attributesToAdd.map((a) => a.id),
				tagIds: tags.length ? tags.map((tag) => tag.id) : undefined,
				price: variantRow[priceKey] ? parseInt(variantRow[priceKey]) : undefined,
				productId: product.id,
				discountPrice: variantRow[discountPriceKey]
					? parseInt(variantRow[discountPriceKey])
					: undefined,
			};
			productVariantsDtos.push(variantResult);
		}
		return productVariantsDtos;
	}

	private async getProductDtoFromFile({
		productVariantsFromFile,
		category,
		template,
		mainVariantIndex = 0,
	}: {
		productVariantsFromFile: ProductVariantFromFile[];
		category: CategoryDto;
		template: ImportTemplateConfig;
		mainVariantIndex: number;
	}): Promise<ProductCreateDto> {
		// keys in doc
		const { imgPathKey, nameKey } = template.info;
		// TODO: check for keys in file

		const mainVariant =
			productVariantsFromFile[mainVariantIndex] ?? productVariantsFromFile[0];

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
