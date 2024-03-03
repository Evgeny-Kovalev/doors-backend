import { VariantsService } from './variants/variants.service';
import { FilesService } from 'src/files/files.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
	ProductCreateDto,
	ProductUpdateDto,
	ProductQueryDto,
	ProductImportDto,
} from './dto/product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './models/Product.entity';
import { FileTypes } from 'src/files/types';
import { ImportService } from './services/import.service';
import { groupBy } from 'src/utils';
import { ImportTemplate, ProductFromFile } from './types';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productsRepository: Repository<Product>,
		private readonly filesService: FilesService,
		private readonly variantsService: VariantsService,
		private readonly importService: ImportService,
	) {}

	async getAll(query?: ProductQueryDto): Promise<Product[]> {
		const products = await this.productsRepository.find({
			where:
				(query?.q && {
					name: Like(`%${query.q.trim().toLowerCase()}%`),
				}) ||
				undefined,
			relations: { variants: { attributes: true } },
		});
		return products;
	}

	async getById(id: number): Promise<Product> {
		const product = await this.productsRepository.findOne({
			where: { id },
			relations: { variants: { attributes: true } },
		});

		if (!product) throw new BadRequestException('Product with this id not found');
		return product;
	}

	async createOne(dto: ProductCreateDto): Promise<Product> {
		try {
			const product = this.productsRepository.create({ ...dto });
			await this.productsRepository.save(product);
			return this.getById(product.id);
		} catch (e) {
			//TODO
			throw Error('cannot create product');
		}
	}

	async update(productId: number, dto: ProductUpdateDto) {
		const product = await this.getById(productId);
		const updatedProduct = await this.productsRepository.save({
			...product,
			...dto,
		});
		return updatedProduct;
	}

	async delete(productId: number) {
		try {
			const p = await this.getById(productId);
			return await this.productsRepository.delete(p.id);
			// TODO success delete response
		} catch (e) {
			// TODO: error msg
			throw new BadRequestException(e + 'product deletion error');
		}
	}

	async importFromFile(dto: ProductImportDto, template: ImportTemplate) {
		const filePath = this.filesService.getPathToFile(dto.fileName, FileTypes.DOC);
		const groupByKey = 'name';

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
				imgPath: imgUrl,
				name: mainVariant[nameKey],
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
