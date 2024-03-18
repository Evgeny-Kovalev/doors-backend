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
import { ImportTemplate, ProductVariantFromFile, ProductFullData } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from 'src/categories/categories.service';

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

	async getAll(query?: ProductQueryDto): Promise<ProductDto[]> {
		try {
			const products: ProductFullData[] = await this.prismaService.product.findMany({
				include: { params: true, variants: { include: { attributes: true } } },
				where: {
					name: { contains: query?.q },
					categoryId: query?.categoryId,
				},
			});
			return products;
		} catch (e) {
			throw new BadRequestException('Cannot get products');
		}
	}

	async getById(id: number): Promise<ProductDto> {
		const product: ProductFullData | null = await this.prismaService.product.findFirst({
			include: { params: true, variants: { include: { attributes: true } } },
			where: { id },
		});

		if (!product) throw new BadRequestException('Product with this id not found');
		return product;
	}

	async createOne(dto: ProductCreateDto): Promise<ProductDto> {
		try {
			const { name, categoryId, description, imgUrl, isVisible, paramIds } = dto;
			const product: ProductDto = await this.prismaService.product.create({
				data: {
					name,
					description,
					imgUrl,
					isVisible,
					category: { connect: { id: categoryId } },
					params: { connect: paramIds.map((id) => ({ id })) },
				},
				include: { params: true, variants: { include: { attributes: true } } },
			});
			return product;
		} catch (e) {
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

			const updatedProduct: ProductFullData = await this.prismaService.product.update({
				where: { id: product.id },
				data: {
					name,
					description,
					imgUrl,
					isVisible,
					category: categoryId ? { connect: { id: categoryId } } : undefined,
					params: newParams ? { set: newParams } : undefined,
				},
				include: { params: true, variants: { include: { attributes: true } } },
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
					params: true,
					variants: { include: { attributes: true } },
				},
			});
		} catch (e) {
			throw new BadRequestException('Product deletion error');
		}
	}

	async importFromFile(
		dto: ProductImportDto,
		template: ImportTemplate,
	): Promise<ProductDto[]> {
		const filePath = this.filesService.getPathToFile(dto.fileName, FileTypes.DOC);
		const groupByKey = 'name';

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
				category,
				template,
			);

			const newProduct = await this.createOne({ ...productDto });

			const productVariantsDtos = await this.importService.getVariantDtosFromFile(
				newProduct,
				productVariants,
				template,
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
		category: Category,
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
			imgUrl: imgUrl,
			name: mainVariant[nameKey],
			categoryId: category.id,
			paramIds: params.map((param) => param.id),
		};
		return productDto;
	}
}
