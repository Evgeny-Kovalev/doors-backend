import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/app/prisma/prisma.service';
import { AttributesService } from '@/app/products/modules/attributes/attributes.service';
import {
	VariantBulkUpdateDto,
	VariantDto,
	VariantCreateDto,
	VariantUpdateDto,
} from './variant.dto';
import { FilesService } from '@/app/files/files.service';
import { VARIANT_INCLUDE } from '@/app/shared/product-include';

@Injectable()
export class VariantsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly attributesService: AttributesService,
		private readonly filesService: FilesService,
	) {}

	private readonly logger = new Logger(VariantsService.name);

	async ensureProductExists(productId: number): Promise<void> {
		const product = await this.prismaService.product.findUnique({
			where: { id: productId },
			select: { id: true },
		});
		if (!product) throw new NotFoundException('Product with this id not found');
	}

	async getAll(productId: number): Promise<VariantDto[]> {
		await this.ensureProductExists(productId);
		return this.prismaService.productVariant.findMany({
			where: { productId },
			include: VARIANT_INCLUDE,
		});
	}

	async getById(id: number): Promise<VariantDto> {
		const variant = await this.prismaService.productVariant.findFirst({
			where: { id },
			include: VARIANT_INCLUDE,
		});
		if (!variant) throw new NotFoundException('Variant with this id not found');
		return variant;
	}

	async createOne(productId: number, dto: VariantCreateDto): Promise<VariantDto> {
		await this.ensureProductExists(productId);

		const {
			imgBackUrl,
			imgFrontUrl,
			sourceId,
			imgUrl,
			attributeIds,
			tagIds,
			price,
			discountPrice,
		} = dto;

		const normalizedSourceId =
			typeof sourceId === 'string' && sourceId.trim() === '' ? null : sourceId;

		try {
			const createdVariant: VariantDto =
				await this.prismaService.productVariant.create({
					data: {
						sourceId: normalizedSourceId ?? null,
						imgBackUrl,
						imgFrontUrl,
						imgUrl,
						price,
						discountPrice,
						attributes: { connect: attributeIds.map((id) => ({ id })) },
						tags: tagIds?.length
							? { connect: tagIds.map((id) => ({ id })) }
							: undefined,
						product: { connect: { id: productId } },
					},
					include: VARIANT_INCLUDE,
				});
			this.logger.log(`Created variant id: ${createdVariant.id}`);
			return createdVariant;
		} catch (e) {
			this.logger.error(e);
			throw new InternalServerErrorException('Cannot create the variant');
		}
	}

	async update(
		variantId: number,
		dto: VariantUpdateDto & { categorySlug?: string },
		image?: Express.Multer.File,
	): Promise<VariantDto> {
		await this.getById(variantId);
		const {
			imgBackUrl,
			imgFrontUrl,
			imgUrl,
			attributeIds,
			price,
			discountPrice,
			tags,
			categorySlug,
		} = dto;

		const newAttributes = attributeIds
			? (await this.attributesService.getManyByIds(attributeIds)).map(({ id }) => ({
					id,
				}))
			: undefined;

		if (newAttributes && attributeIds && newAttributes.length !== attributeIds.length)
			throw new BadRequestException(
				'Attributes with these IDs are missing or there are duplicate ID.',
			);

		if (image && !categorySlug)
			throw new BadRequestException('categorySlug is required when image is provided');

		const uploadedImage =
			image && categorySlug
				? await this.filesService.uploadFileToS3(image, {
						prefix: `category/${categorySlug}/custom-images`,
						fileName: `${variantId}.${image.originalname.split('.').pop()}`,
					})
				: undefined;

		try {
			const updatedVariant = await this.prismaService.productVariant.update({
				where: { id: variantId },
				data: {
					imgUrl: uploadedImage ? `${uploadedImage.url}?v=${Date.now()}` : imgUrl,
					imgBackUrl,
					imgFrontUrl,
					price,
					discountPrice,
					attributes: newAttributes ? { set: newAttributes } : undefined,
					tags: tags ? { set: tags } : undefined,
				},
				include: VARIANT_INCLUDE,
			});
			return updatedVariant;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot update the product variant');
		}
	}

	async updateMany(dto: VariantBulkUpdateDto): Promise<VariantDto[]> {
		const results: VariantDto[] = [];
		for (const item of dto.items) {
			const { id, ...updateDto } = item;
			results.push(await this.update(id, updateDto));
		}
		return results;
	}

	async deleteById(id: number): Promise<VariantDto> {
		await this.getById(id);
		try {
			return this.prismaService.productVariant.delete({
				where: { id },
				include: VARIANT_INCLUDE,
			});
		} catch (e) {
			this.logger.error(e);
			throw new InternalServerErrorException('Cannot delete the product variant');
		}
	}
}
