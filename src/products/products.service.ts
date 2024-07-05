import { AttributesService } from './modules/attributes/attributes.service';
import { VariantsService } from './modules/variants/variants.service';
import { FilesService } from 'src/files/files.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
	ProductCreateDto,
	ProductUpdateDto,
	ProductQueryDto,
	ProductImportDto,
	ProductDto,
} from './dto/product.dto';
import { FileTypes } from 'src/files/types';
import { ImportService } from './services/import.service';
import { groupBy } from 'src/utils';
import { ImportTemplate, ProductVariantFromFile } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from 'src/categories/categories.service';
import { PaginatedDto, PaginationParamsDto } from 'src/shared/pagination/dto';
import { CategoryDto } from 'src/categories/dto';
import slugify from 'slugify';

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
		{ limit, page }: PaginationParamsDto,
	): Promise<PaginatedDto<ProductDto>> {
		try {
			const categories = query.categorySlug
				? await this.categoriesService.getNestedCategoriesList(
						await this.categoriesService.getBySlug(query.categorySlug),
						await this.categoriesService.getAll(),
					)
				: undefined;
			const [products, count] = await this.prismaService.$transaction([
				this.prismaService.product.findMany({
					include: {
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
							},
						},
					},
					where: {
						name: { contains: query?.q, mode: 'insensitive' },
						categoryId: categories
							? {
									in: categories.map((c) => c.id),
								}
							: undefined,
					},
					take: limit,
					skip: (page - 1) * limit,
				}),
				this.prismaService.product.count({
					where: {
						name: { contains: query?.q, mode: 'insensitive' },
						categoryId: categories
							? {
									in: categories.map((c) => c.id),
								}
							: undefined,
					},
				}),
			]);

			return new PaginatedDto<ProductDto>(products, page, limit, count);
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot get products');
		}
	}

	async getById(id: number) {
		const product = await this.prismaService.product.findFirst({
			include: {
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
					},
				},
			},
			where: { id },
		});
		if (!product) throw new BadRequestException('Product with this id not found');
		return product;
	}

	async getBySlug(slug: string) {
		const product = await this.prismaService.product.findFirst({
			include: {
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
					},
				},
			},
			where: { slug },
		});
		if (!product) throw new BadRequestException('Product with this slug not found');
		return product;
	}

	async createOne(dto: ProductCreateDto): Promise<ProductDto> {
		try {
			const { name, categoryId, description, imgUrl, isVisible, paramIds } = dto;
			const product: ProductDto = await this.prismaService.product.create({
				data: {
					slug: slugify(name, { lower: true }),
					name,
					description,
					imgUrl,
					isVisible,
					category: { connect: { id: categoryId } },
					params: { connect: paramIds.map((id) => ({ id })) },
				},
				include: {
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
						},
					},
				},
			});
			return product;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot create product');
		}
	}

	async update(productId: number, dto: ProductUpdateDto): Promise<ProductDto> {
		try {
			const product = await this.getById(productId);
			const { name, categoryId, description, imgUrl, isVisible, paramIds } = dto;

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
					slug: name && slugify(name, { lower: true }),
					name,
					description,
					imgUrl,
					isVisible,
					category: categoryId ? { connect: { id: categoryId } } : undefined,
					params: newParams ? { set: newParams } : undefined,
				},
				include: {
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
						},
					},
				},
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
				include: {
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
						},
					},
				},
			});
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Product deletion error');
		}
	}

	async importFromFile(dto: ProductImportDto): Promise<ProductDto[]> {
		const filePath = this.filesService.getPathToFile(dto.fileName, FileTypes.DOC);
		const GROUP_BY_KEY = 'name';

		const category = await this.categoriesService.getById(dto.categoryId);

		let productsFromFile: ProductVariantFromFile[] = [];

		try {
			productsFromFile =
				await this.importService.parseCsvFile<ProductVariantFromFile>(filePath);
		} catch (e) {
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
		const imgPath = await this.filesService.getOrLoadFile({
			url,
			fileType: FileTypes.IMG,
		});

		const imgUrl = this.filesService.convertImagePathToUrl(imgPath);

		const productDto: ProductCreateDto = {
			// TODO: desc
			description: 'test desc',
			categoryId: category.id,
			imgUrl: imgUrl,
			name: mainVariant[nameKey],
			paramIds: params.map((param) => param.id),
		};
		return productDto;
	}
}
