import { AttributesService } from './modules/attributes/attributes.service';
import { VariantsService } from './modules/variants/variants.service';
import { FilesService } from 'src/files/files.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
	ProductCreateDto,
	ProductUpdateDto,
	ProductQueryDto,
	ProductImportDto,
	ProductDto,
} from './dto/product.dto';
import { Category } from '@prisma/client';
import { FileTypes } from 'src/files/types';
import { ImportService } from './services/import.service';
import { groupBy } from 'src/utils';
import { ImportTemplate, ProductVariantFromFile } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from 'src/categories/categories.service';
import { PaginatedDto, PaginationParamsDto } from 'src/shared/pagination/dto';
import { CategoryDto } from 'src/categories/dto';

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

	async getAll(
		query: ProductQueryDto,
		{ limit, page }: PaginationParamsDto,
	): Promise<PaginatedDto<ProductDto>> {
		try {
			const [products, count] = await this.prismaService.$transaction([
				this.prismaService.product.findMany({
					include: {
						mainCategory: true,
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
						categories: true,
					},
					where: {
						name: { contains: query?.q },
						categories: query.categoryIds && {
							some: { id: { in: [...query.categoryIds] } },
						},
					},
					take: limit,
					skip: (page - 1) * limit,
				}),
				this.prismaService.product.count({
					where: {
						name: { contains: query?.q },
						categories: query.categoryIds && {
							some: { id: { in: [...query.categoryIds] } },
						},
					},
				}),
			]);

			return new PaginatedDto<ProductDto>(products, page, limit, count);
		} catch (e) {
			throw new BadRequestException('Cannot get products');
		}
	}

	async getById(id: number): Promise<ProductDto> {
		const product: ProductDto | null = await this.prismaService.product.findFirst({
			include: {
				mainCategory: true,
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
				categories: true,
			},
			where: { id },
		});

		if (!product) throw new BadRequestException('Product with this id not found');
		return product;
	}

	async createOne(dto: ProductCreateDto): Promise<ProductDto> {
		try {
			const { name, categoryIds, description, imgUrl, isVisible, paramIds } = dto;
			const product: ProductDto = await this.prismaService.product.create({
				data: {
					name,
					description,
					imgUrl,
					isVisible,
					mainCategory: { connect: { id: dto.mainCategoryId } },
					categories: { connect: categoryIds.map((id) => ({ id })) },
					params: { connect: paramIds.map((id) => ({ id })) },
				},
				include: {
					mainCategory: true,
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
					categories: true,
				},
			});
			return product;
		} catch (e) {
			throw new BadRequestException('Cannot create product');
		}
	}

	async update(productId: number, dto: ProductUpdateDto): Promise<ProductDto> {
		try {
			const product = await this.getById(productId);
			const { name, categoryIds, description, imgUrl, isVisible, paramIds } = dto;

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
					name,
					description,
					imgUrl,
					isVisible,
					categories: categoryIds
						? { connect: categoryIds.map((id) => ({ id })) }
						: undefined,
					params: newParams ? { set: newParams } : undefined,
				},
				include: {
					mainCategory: true,
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
					categories: true,
				},
			});
			return updatedProduct;
		} catch (e) {
			throw new BadRequestException('Cannot update product');
		}
	}

	async delete(id: number): Promise<ProductDto> {
		try {
			await this.getById(id);
			return await this.prismaService.product.delete({
				where: { id },
				include: {
					mainCategory: true,
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
					categories: true,
				},
			});
		} catch (e) {
			throw new BadRequestException('Product deletion error');
		}
	}

	async importFromFile(dto: ProductImportDto): Promise<ProductDto[]> {
		const filePath = this.filesService.getPathToFile(dto.fileName, FileTypes.DOC);
		const groupByKey = 'name';

		const categories = await Promise.all(
			dto.categoryIds.map((id) => this.categoriesService.getById(id)),
		);
		const mainCategory = await this.categoriesService.getById(dto.mainCategoryId);

		let productsFromFile: ProductVariantFromFile[] = [];

		try {
			productsFromFile =
				await this.importService.parseCsvFile<ProductVariantFromFile>(filePath);
		} catch (e) {
			throw new BadRequestException('File parse error');
		}
		if (!productsFromFile.length)
			throw new BadRequestException('Invalid or empty file');

		const groupedProducts = groupBy<ProductVariantFromFile>(productsFromFile, (i) => {
			if (!i[groupByKey])
				throw new BadRequestException(
					`The file does not have the attribute '${groupByKey}' for grouping products`,
				);
			return i[groupByKey];
		});

		const allProducts = Object.values(groupedProducts);

		const createdProducts: ProductDto[] = [];

		for (const productVariants of allProducts) {
			const productDto = await this.getProductDtoFromFile(
				productVariants,
				categories,
				dto.template,
				mainCategory,
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
		categories: Category[],
		template: ImportTemplate,
		mainCategory: CategoryDto,
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
			mainCategoryId: mainCategory.id,
			imgUrl: imgUrl,
			name: mainVariant[nameKey],
			categoryIds: categories.map((cat) => cat.id),
			paramIds: params.map((param) => param.id),
		};
		return productDto;
	}
}
