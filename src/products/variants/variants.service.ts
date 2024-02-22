import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { VariantCreateDto, VariantUpdateDto } from '../dto/variant.dto';
import { AttributeValue } from '../models/Attribute.entity';
import { ProductVariant } from '../models/ProductVariant.entity';
import { Product } from '../models/Product.entity';

@Injectable()
export class VariantsService {
	constructor(
		@InjectRepository(ProductVariant)
		private readonly productVariantsRepository: Repository<ProductVariant>,
		@InjectRepository(AttributeValue)
		private readonly attributeValuesRepository: Repository<AttributeValue>,
	) {}

	async getAll(product: Product): Promise<ProductVariant[]> {
		const variants = await this.productVariantsRepository.find({
			where: { product },
			relations: { attributes: { attribute: true } },
		});
		return variants;
	}

	async getById(id: number): Promise<ProductVariant> {
		const variant = await this.productVariantsRepository.findOne({
			where: { id },
			relations: { attributes: { attribute: true } },
		});
		//TODO
		if (!variant)
			throw new HttpException(
				'Variant with this id not found',
				HttpStatus.BAD_REQUEST,
			);
		return variant;
	}

	async createOne(product: Product, dto: VariantCreateDto): Promise<ProductVariant> {
		const variant = this.productVariantsRepository.create({
			...dto,
			product,
			attributes: await this.attributeValuesRepository.findBy({
				id: In(dto.attributeIds),
			}),
		});
		await this.productVariantsRepository.save(variant);
		const variantWithRelations = await this.getById(variant.id);
		return variantWithRelations;
	}

	async update(variantId: number, dto: VariantUpdateDto): Promise<ProductVariant> {
		const variant = await this.getById(variantId);
		// TODO  change to attributesService
		const newAttributes =
			dto.attributeIds &&
			(await this.attributeValuesRepository.find({
				relations: { attribute: true },
				where: { id: In(dto.attributeIds) },
			}));
		if (newAttributes?.length !== dto.attributeIds?.length)
			throw new BadRequestException(
				'Attributes with these IDs are missing or there are duplicate ID.',
			);
		newAttributes && (variant.attributes = newAttributes);

		const updatedVariant = await this.productVariantsRepository.save({
			...variant,
			...dto,
		});
		return updatedVariant;
	}

	async delete(id: number) {
		return this.productVariantsRepository.delete({ id });
	}
	// async update(dto: VariantUpdateDto) {}
}
