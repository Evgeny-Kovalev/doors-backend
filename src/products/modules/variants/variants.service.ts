import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { VariantCreateDto, VariantUpdateDto } from './variant.dto';
import { Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttributesService } from 'src/products/modules/attributes/attributes.service';
import { VariantFullData } from './types';

@Injectable()
export class VariantsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly attributesService: AttributesService,
	) {}

	async getAll(product: Product): Promise<VariantFullData[]> {
		const variants: VariantFullData[] =
			await this.prismaService.productVariant.findMany({
				where: { product },
				include: { attributes: true },
			});
		return variants;
	}

	async getById(id: number): Promise<VariantFullData> {
		const variant = await this.prismaService.productVariant.findFirst({
			where: { id },
			include: { attributes: true },
		});
		if (!variant) throw new BadRequestException('Variant with this id not found');
		return variant;
	}

	async createOne(product: Product, dto: VariantCreateDto): Promise<VariantFullData> {
		const { imgUrl, attributeIds, productId, price, discountPrice } = dto;
		try {
			const createdVariant: VariantFullData =
				await this.prismaService.productVariant.create({
					data: {
						imgUrl,
						price,
						discountPrice,
						attributes: { connect: attributeIds.map((id) => ({ id })) },
						product: { connect: { id: productId } },
					},
					include: { attributes: true },
				});
			return createdVariant;
		} catch (e) {
			throw new InternalServerErrorException('Cannot create the variant');
		}
	}

	async update(variantId: number, dto: VariantUpdateDto): Promise<VariantFullData> {
		await this.getById(variantId);
		const { imgUrl, attributeIds, price, discountPrice } = dto;

		const newAttributes = attributeIds
			? (await this.attributesService.getManyByIds(attributeIds)).map(({ id }) => ({
					id,
				}))
			: undefined;

		if (newAttributes && attributeIds && newAttributes.length !== attributeIds.length)
			throw new BadRequestException(
				'Attributes with these IDs are missing or there are duplicate ID.',
			);

		try {
			const updatedVariant = await this.prismaService.productVariant.update({
				where: { id: variantId },
				data: {
					imgUrl,
					price,
					discountPrice,
					attributes: newAttributes ? { set: newAttributes } : undefined,
				},
				include: { attributes: true },
			});
			return updatedVariant;
		} catch (e) {
			throw new BadRequestException('Cannnot update the product variant');
		}
	}

	async deleteById(id: number): Promise<VariantFullData> {
		await this.getById(id);
		try {
			return this.prismaService.productVariant.delete({
				where: { id },
				include: { attributes: true },
			});
		} catch (e) {
			throw new InternalServerErrorException('Cannot delete the product variant');
		}
	}
}
