import { AttributesService } from '../modules/attributes/attributes.service';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/app/prisma/prisma.service';
import { ProductCreateDto, ProductDto, ProductUpdateDto } from '../dto/product.dto';
import slugify from 'slugify';
import { Prisma } from '@/app/generated/prisma';
import { PRODUCT_DETAIL_INCLUDE } from '../../shared/product-include';
import { ProductsQueryService } from './products-query.service';

@Injectable()
export class ProductsCommandService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly attributesService: AttributesService,
		private readonly productsQueryService: ProductsQueryService,
	) {}

	private readonly logger = new Logger(ProductsCommandService.name);

	async createOne(dto: ProductCreateDto): Promise<ProductDto> {
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

			const product: ProductDto = await this.prismaService.product.create({
				data: productData,
				include: PRODUCT_DETAIL_INCLUDE,
			});
			this.logger.log(`Created product: ${product.name}`);
			return product;
		} catch (e) {
			this.logger.error(e);
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				throw new ConflictException('Product with this slug already exists');
			}
			throw new BadRequestException('Cannot create product');
		}
	}

	async update(slug: string, dto: ProductUpdateDto): Promise<ProductDto> {
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

			const updatedProduct: ProductDto = await this.prismaService.product.update({
				where: { id: product.id },
				data: {
					// slug: name && slugify(name, { lower: true }),
					name,
					description,
					imgUrl,
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
			return updatedProduct;
		} catch (e) {
			if (e instanceof NotFoundException || e instanceof BadRequestException) throw e;
			this.logger.error(e);
			throw new BadRequestException('Cannot update product');
		}
	}

	async delete(id: number): Promise<ProductDto> {
		try {
			await this.productsQueryService.getById(id);
			return await this.prismaService.product.delete({
				where: { id },
				include: PRODUCT_DETAIL_INCLUDE,
			});
		} catch (e) {
			if (e instanceof NotFoundException) throw e;
			this.logger.error(e);
			throw new BadRequestException('Product deletion error');
		}
	}
}
