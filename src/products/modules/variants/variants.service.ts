import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttributesService } from 'src/products/modules/attributes/attributes.service';
import { ProductDto } from '../../dto/product.dto';
import { VariantDto, VariantCreateDto, VariantUpdateDto } from './variant.dto';

const DEFAULT_INCLUDE = {
	attributes: { include: { key: true, value: true } },
	tags: true,
};

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
			include: DEFAULT_INCLUDE,
		});
		return variants;
	}

	async getById(id: number): Promise<VariantDto> {
		const variant = await this.prismaService.productVariant.findFirst({
			where: { id },
			include: DEFAULT_INCLUDE,
		});
		if (!variant) throw new BadRequestException('Variant with this id not found');
		return variant;
	}

	async createOne(product: ProductDto, dto: VariantCreateDto): Promise<VariantDto> {
		const { sourceId, imgUrl, attributeIds, productId, price, discountPrice } = dto;
		try {
			const createdVariant: VariantDto =
				await this.prismaService.productVariant.create({
					data: {
						sourceId,
						imgUrl,
						price,
						discountPrice,
						attributes: { connect: attributeIds.map((id) => ({ id })) },
						product: { connect: { id: productId } },
					},
					include: DEFAULT_INCLUDE,
				});
			this.logger.log(`Created variant id: ${createdVariant.id}`);
			return createdVariant;
		} catch (e) {
			this.logger.error(e);
			throw new InternalServerErrorException('Cannot create the variant');
		}
	}

	async update(variantId: number, dto: VariantUpdateDto): Promise<VariantDto> {
		await this.getById(variantId);
		const { imgUrl, attributeIds, price, discountPrice, tags } = dto;

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
					tags: tags ? { set: tags } : undefined,
				},
				include: DEFAULT_INCLUDE,
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
				include: DEFAULT_INCLUDE,
			});
		} catch (e) {
			this.logger.error(e);
			throw new InternalServerErrorException('Cannot delete the product variant');
		}
	}
}
