import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductCreateDto, ProductUpdateDto, ProductQueryDto } from './dto/product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './models/Product.entity';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productsRepository: Repository<Product>,
	) {}

	async getAll(query?: ProductQueryDto): Promise<Product[]> {
		const products = await this.productsRepository.find({
			where:
				(query?.q && {
					name: Like(`%${query.q.trim().toLowerCase()}%`),
				}) ||
				undefined,
			relations: { variants: { attributes: { attribute: true } } },
		});
		return products;
	}

	async getById(id: number): Promise<Product> {
		const product = await this.productsRepository.findOne({
			where: { id },
			relations: { variants: { attributes: { attribute: true } } },
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
			throw new BadRequestException('product deletion error');
		}
	}
}
