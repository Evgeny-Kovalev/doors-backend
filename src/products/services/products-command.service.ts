import { AttributesService } from '../modules/attributes/attributes.service';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/app/prisma/prisma.service';
import {
	ProductBulkUpdateDto,
	ProductCreateDto,
	ProductDto,
	ProductUpdateDto,
} from '../dto/product.dto';
import slugify from 'slugify';
import { Prisma } from '@/app/generated/prisma';
import { PRODUCT_DETAIL_INCLUDE } from '../../shared/product-include';
import { ProductsQueryService } from './products-query.service';
import { FilesService } from '@/app/files/files.service';
import { AuditLogService } from '@/app/audit-log/audit-log.service';
import { AuditLogWriteError } from '@/app/audit-log/audit-log.error';

type ProductAuditOptions = {
	batchId?: string;
	metadata?: Prisma.InputJsonObject;
};

@Injectable()
export class ProductsCommandService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly attributesService: AttributesService,
		private readonly productsQueryService: ProductsQueryService,
		private readonly filesService: FilesService,
		private readonly auditLogService: AuditLogService,
	) {}

	private readonly logger = new Logger(ProductsCommandService.name);

	async createOne(
		dto: ProductCreateDto,
		auditOptions: ProductAuditOptions = {},
	): Promise<ProductDto> {
		try {
			const {
				name,
				categoryId,
				description,
				imgUrl,
				isVisible,
				paramIds,
				productType,
			} = dto;

			const slug = slugify(name, { lower: true });
			const productData = {
				slug,
				name,
				description,
				imgUrl,
				isVisible,
				productType,
				category: categoryId ? { connect: { id: categoryId } } : undefined,
				params: { connect: paramIds.map((id) => ({ id })) },
			};

			const product = await this.prismaService.$transaction(async (tx) => {
				const createdProduct: ProductDto = await tx.product.create({
					data: productData,
					include: PRODUCT_DETAIL_INCLUDE,
				});
				await this.auditLogService.record(tx, {
					action: 'product.created',
					entityType: 'product',
					entityId: createdProduct.id,
					entityLabel: createdProduct.slug || createdProduct.name,
					...auditOptions,
				});
				return createdProduct;
			});
			this.logger.log(`Created product: ${product.name}`);
			return product;
		} catch (e) {
			this.logger.error(e);
			if (e instanceof AuditLogWriteError) {
				throw new InternalServerErrorException('Cannot persist product audit log');
			}
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				throw new ConflictException('Product with this slug already exists');
			}
			throw new BadRequestException('Cannot create product');
		}
	}

	async update(
		slug: string,
		dto: ProductUpdateDto & { categorySlug?: string },
		image?: Express.Multer.File,
		auditOptions: ProductAuditOptions = {},
	): Promise<ProductDto> {
		try {
			const product = await this.productsQueryService.getBySlug(slug, {
				includeHidden: true,
			});
			const {
				name,
				categoryId,
				description,
				imgUrl,
				isVisible,
				paramIds,
				productType,
				price,
				discountPrice,
				categorySlug,
			} = dto;

			const newParams = paramIds
				? (await this.attributesService.getManyByIds(paramIds)).map(({ id }) => ({
						id,
					}))
				: undefined;

			if (newParams && paramIds && newParams.length !== paramIds.length)
				throw new BadRequestException(
					'Params with these IDs are missing or there are duplicate ID.',
				);

			const uploadedImgUrl = await this.uploadProductImage({
				slug: product.slug,
				categorySlug,
				image,
			});

			const updatedProduct = await this.prismaService.$transaction(async (tx) => {
				const result: ProductDto = await tx.product.update({
					where: { id: product.id },
					data: {
						// slug: name && slugify(name, { lower: true }),
						name,
						description,
						imgUrl: uploadedImgUrl ?? imgUrl,
						isVisible,
						productType,
						category: categoryId ? { connect: { id: categoryId } } : undefined,
						params: newParams ? { set: newParams } : undefined,
						variants:
							price || price === null || discountPrice || discountPrice === null
								? {
										updateMany: {
											data: {
												price,
												discountPrice,
											},
											where: {
												productId: product.id,
											},
										},
									}
								: undefined,
					},
					include: PRODUCT_DETAIL_INCLUDE,
				});
				await this.auditLogService.record(tx, {
					action: 'product.updated',
					entityType: 'product',
					entityId: result.id,
					entityLabel: result.slug || result.name,
					...auditOptions,
				});
				return result;
			});
			return updatedProduct;
		} catch (e) {
			if (e instanceof NotFoundException || e instanceof BadRequestException) throw e;
			if (e instanceof AuditLogWriteError) {
				throw new InternalServerErrorException('Cannot persist product audit log');
			}
			this.logger.error(e);
			throw new BadRequestException('Cannot update product');
		}
	}

	private async uploadProductImage({
		slug,
		categorySlug,
		image,
	}: {
		slug: string;
		categorySlug?: string;
		image?: Express.Multer.File;
	}): Promise<string | undefined> {
		if (!image) return undefined;

		if (!categorySlug)
			throw new BadRequestException(
				'categorySlug is required when an image is provided',
			);

		const ext = image.originalname.split('.').pop();
		const uploaded = await this.filesService.uploadFileToS3(image, {
			prefix: `category/${categorySlug}/custom-images`,
			fileName: `${slug}.${ext}`,
		});
		return `${uploaded.url}?v=${Date.now()}`;
	}

	async updateMany(dto: ProductBulkUpdateDto): Promise<ProductDto[]> {
		const results: ProductDto[] = [];
		const batchId = this.auditLogService.createBatchId();
		for (const item of dto.items) {
			const { slug, ...updateDto } = item;
			results.push(await this.update(slug, updateDto, undefined, { batchId }));
		}
		return results;
	}

	async delete(id: number): Promise<ProductDto> {
		try {
			await this.productsQueryService.getById(id);
			return await this.prismaService.$transaction(async (tx) => {
				const deletedProduct = await tx.product.delete({
					where: { id },
					include: PRODUCT_DETAIL_INCLUDE,
				});
				await this.auditLogService.record(tx, {
					action: 'product.deleted',
					entityType: 'product',
					entityId: deletedProduct.id,
					entityLabel: deletedProduct.slug || deletedProduct.name,
				});
				return deletedProduct;
			});
		} catch (e) {
			if (e instanceof NotFoundException) throw e;
			if (e instanceof AuditLogWriteError) {
				throw new InternalServerErrorException('Cannot persist product audit log');
			}
			this.logger.error(e);
			throw new BadRequestException('Product deletion error');
		}
	}
}
