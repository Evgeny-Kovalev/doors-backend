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
import { Product } from '@prisma/client';
import { FileTypes } from 'src/files/types';
import { ImportService } from './services/import.service';
import { groupBy } from 'src/utils';
import { ImportTemplate, ProductFromFile, ProductFullData } from './types';
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
	) {}

	async getAll(query?: ProductQueryDto): Promise<ProductDto[]> {
		const products: ProductFullData[] = await this.prismaService.product.findMany({
			include: { variants: { include: { attributes: true } } },
			where: {
				name: {
					contains: query?.q,
				},
			},
		});
		return products;
	}

	async getById(id: number): Promise<ProductDto> {
		const product: ProductFullData | null = await this.prismaService.product.findFirst({
			include: { variants: { include: { attributes: true } } },
			where: { id },
		});

		if (!product) throw new BadRequestException('Product with this id not found');
		return product;
	}

	async createOne(dto: ProductCreateDto): Promise<ProductDto> {
		try {
			const { name, categoryId, description, imgUrl, isVisible } = dto;
			const product: ProductDto = await this.prismaService.product.create({
				data: {
					name,
					description,
					imgUrl,
					isVisible,
					category: { connect: { id: categoryId } },
				},
				include: { variants: { include: { attributes: true } } },
			});
			return product;
		} catch (e) {
			throw new BadRequestException('Cannot create product');
		}
	}

	async update(productId: number, dto: ProductUpdateDto): Promise<ProductDto> {
		try {
			const product = await this.getById(productId);
			const { name, categoryId, description, imgUrl, isVisible } = dto;
			const updatedProduct: ProductFullData = await this.prismaService.product.update({
				where: { id: product.id },
				data: {
					name,
					description,
					imgUrl,
					isVisible,
					category: categoryId ? { connect: { id: categoryId } } : undefined,
				},
				include: { variants: { include: { attributes: true } } },
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
					variants: { include: { attributes: true } },
				},
			});
		} catch (e) {
			throw new BadRequestException('Product deletion error');
		}
	}

	async importFromFile(dto: ProductImportDto, template: ImportTemplate) {
		const filePath = this.filesService.getPathToFile(dto.fileName, FileTypes.DOC);
		const groupByKey = 'name';

		//!FIX
		// const category = this.categoriesService.getById(categoryId);

		let productsFromFile: ProductFromFile[] = [];

		try {
			productsFromFile =
				await this.importService.parseCsvFile<ProductFromFile>(filePath);
		} catch (e) {
			throw new Error(e);
		}
		if (!productsFromFile.length)
			throw new BadRequestException('Invalid or empty file');

		const groupedProducts = groupBy<ProductFromFile>(
			productsFromFile,
			(i) => i[groupByKey],
		);

		const allVariants = Object.values(groupedProducts);

		const createdProducts: Product[] = [];

		for (const productVariantsRows of allVariants) {
			const mainVariant = productVariantsRows[0];

			// keys in doc
			const { imgPathKey, nameKey } = template.info;
			// TODO: check for keys in file

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
				// category: category.id,
				// !FIX
				categoryId: 1,
			};

			const newProduct = await this.createOne({ ...productDto });

			const productVariantsDtos = await this.importService.getVariantsDtosFileObj(
				newProduct,
				productVariantsRows,
				template,
			);

			await Promise.all(
				productVariantsDtos.map(
					async (variantDto) =>
						await this.variantsService.createOne(newProduct, variantDto),
				),
			);

			const createdProduct = await this.getById(newProduct.id);
			createdProducts.push(createdProduct);
		}
		return createdProducts;
	}
}
