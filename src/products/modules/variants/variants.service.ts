import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { VariantCreateDto, VariantDto, VariantUpdateDto } from './variant.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttributesService } from 'src/products/modules/attributes/attributes.service';
import { ProductDto } from 'src/products/dto/product.dto';

@Injectable()
export class VariantsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly attributesService: AttributesService,
	) {}

	private readonly logger = new Logger(VariantsService.name);

	async getAll(product: ProductDto): Promise<VariantDto[]> {
		const variants: VariantDto[] = await this.prismaService.productVariant.findMany({
			where: { productId: product.id },
			include: { attributes: { include: { key: true, value: true } } },
		});
		return variants;
	}

	async getById(id: number): Promise<VariantDto> {
		const variant = await this.prismaService.productVariant.findFirst({
			where: { id },
			include: { attributes: { include: { key: true, value: true } } },
		});
		if (!variant) throw new BadRequestException('Variant with this id not found');
		return variant;
	}

	async createOne(product: ProductDto, dto: VariantCreateDto): Promise<VariantDto> {
		const { imgUrl, attributeIds, productId, price, discountPrice } = dto;
		try {
			const createdVariant: VariantDto =
				await this.prismaService.productVariant.create({
					data: {
						imgUrl,
						price,
						discountPrice,
						attributes: { connect: attributeIds.map((id) => ({ id })) },
						product: { connect: { id: productId } },
					},
					include: { attributes: { include: { key: true, value: true } } },
				});
			return createdVariant;
		} catch (e) {
			this.logger.error(e);
			throw new InternalServerErrorException('Cannot create the variant');
		}
	}

	async update(variantId: number, dto: VariantUpdateDto): Promise<VariantDto> {
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
				include: { attributes: { include: { key: true, value: true } } },
			});
			return updatedVariant;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannnot update the product variant');
		}
	}

	async deleteById(id: number): Promise<VariantDto> {
		await this.getById(id);
		try {
			return this.prismaService.productVariant.delete({
				where: { id },
				include: { attributes: { include: { key: true, value: true } } },
			});
		} catch (e) {
			this.logger.error(e);
			throw new InternalServerErrorException('Cannot delete the product variant');
		}
	}
}
