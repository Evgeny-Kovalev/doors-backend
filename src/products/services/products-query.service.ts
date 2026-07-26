import { CategoriesService } from '@/app/categories/categories.service';
import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/app/prisma/prisma.service';
import { PaginatedDto, PaginationQueryDto } from '@/app/shared/pagination/dto';
import { ProductWithSeoDto, ProductDto } from '../dto/product.dto';
import { CategoryDto } from '../../categories/dto';
import { Prisma, SeoEntityType } from '@/app/generated/prisma';
import { SeoService } from '@/app/seo/seo.service';
import {
	PRODUCT_DETAIL_INCLUDE,
	PRODUCT_LIST_INCLUDE,
} from '@/app/shared/product-include';
import { getProductPriceRange } from '../utils';
import { VisibilityOptions, visibleOnlyWhere } from '@/app/shared/visibility';
import type { ProductQueryParsed } from '@/contracts';

@Injectable()
export class ProductsQueryService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly categoriesService: CategoriesService,
		private readonly seoService: SeoService,
	) {}

	private readonly logger = new Logger(ProductsQueryService.name);

	async getAll(
		query: ProductQueryParsed,
		{ limit, page }: PaginationQueryDto,
		options: VisibilityOptions = {},
	): Promise<PaginatedDto<ProductDto>> {
		try {
			const productFilter = await this.buildProductFilter(query, options);
			const paginationSkip = (page - 1) * limit;
			const { sort, order } = query;

			// sort=name: алфавит по name -> id; категория и теги не учитываются
			if (sort === 'name') {
				const [products, count] = await this.prismaService.$transaction([
					this.prismaService.product.findMany({
						include: PRODUCT_LIST_INCLUDE,
						where: productFilter,
						take: limit,
						skip: paginationSkip,
						orderBy: [{ name: order }, { id: 'asc' }],
					}),
					this.prismaService.product.count({ where: productFilter }),
				]);

				return new PaginatedDto<ProductDto>(products, page, limit, count);
			}

			if (sort === 'price') {
				return await this.getAllSortedByPrice(
					query,
					productFilter,
					order,
					paginationSkip,
					limit,
					page,
					options,
				);
			}

			return await this.getAllDefaultSort(
				query,
				productFilter,
				paginationSkip,
				limit,
				page,
				options,
			);
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot get products');
		}
	}

	async buildProductFilter(
		query: ProductQueryParsed,
		options: VisibilityOptions = {},
	): Promise<Prisma.ProductWhereInput> {
		const productFilter: Prisma.ProductWhereInput = {
			...visibleOnlyWhere(options),
		};
		if (query?.q) productFilter.name = { contains: query.q, mode: 'insensitive' };
		if (query?.productTypes) productFilter.productType = { in: query.productTypes };
		if (query?.categorySlug) {
			const ids = await this.categoriesService.getDescendantCategoryIdsBySlug(
				query.categorySlug,
			);
			if (ids.length === 1) productFilter.categoryId = { equals: ids[0] };
			else if (ids.length > 1) productFilter.categoryId = { in: ids };
		}
		return productFilter;
	}

	private async buildProductSqlWhere(
		query: ProductQueryParsed,
		options: VisibilityOptions = {},
	): Promise<Prisma.Sql> {
		const conditions: Prisma.Sql[] = [];

		if (!options.includeHidden) {
			conditions.push(Prisma.sql`p."isVisible" = true`);
		}
		if (query.q) {
			conditions.push(Prisma.sql`p.name ILIKE ${`%${query.q}%`}`);
		}
		if (query.productTypes?.length) {
			conditions.push(
				Prisma.sql`p."productType"::text IN (${Prisma.join(query.productTypes)})`,
			);
		}
		if (query.categorySlug) {
			const ids = await this.categoriesService.getDescendantCategoryIdsBySlug(
				query.categorySlug,
			);
			if (ids.length === 1) {
				conditions.push(Prisma.sql`p."categoryId" = ${ids[0]}`);
			} else if (ids.length > 1) {
				conditions.push(Prisma.sql`p."categoryId" IN (${Prisma.join(ids)})`);
			}
		}

		return conditions.length ? Prisma.join(conditions, ' AND ') : Prisma.sql`TRUE`;
	}

	/**
	 * sort=default: тег -> наличие цены -> category.order -> id.
	 * "Есть цена" = хотя бы один вариант с COALESCE(discountPrice, price).
	 */
	private async getAllDefaultSort(
		query: ProductQueryParsed,
		productFilter: Prisma.ProductWhereInput,
		skip: number,
		take: number,
		page: number,
		options: VisibilityOptions = {},
	): Promise<PaginatedDto<ProductDto>> {
		const whereSql = await this.buildProductSqlWhere(query, options);

		const rows = await this.prismaService.$queryRaw<{ id: number }[]>`
			SELECT p.id
			FROM "Product" p
			LEFT JOIN "Category" c ON c.id = p."categoryId"
			WHERE ${whereSql}
			ORDER BY
				EXISTS (
					SELECT 1
					FROM "ProductVariant" v
					INNER JOIN "_ProductVariantToTag" vt ON vt."A" = v.id
					WHERE v."productId" = p.id
				) DESC,
				EXISTS (
					SELECT 1
					FROM "ProductVariant" v
					WHERE v."productId" = p.id
						AND COALESCE(v."discountPrice", v.price) IS NOT NULL
				) DESC,
				c."order" ASC NULLS LAST,
				p.id ASC
			LIMIT ${take} OFFSET ${skip}
		`;

		const [products, count] = await Promise.all([
			rows.length ? this.findProductsByIdsInOrder(rows.map((row) => row.id)) : [],
			this.prismaService.product.count({ where: productFilter }),
		]);

		return new PaginatedDto<ProductDto>(products, page, take, count);
	}

	/**
	 * sort=price: только min-цена по вариантам (COALESCE(discountPrice, price)), без категории и тегов.
	 * Без цены — в конец (NULLS LAST).
	 */
	private async getAllSortedByPrice(
		query: ProductQueryParsed,
		productFilter: Prisma.ProductWhereInput,
		order: 'asc' | 'desc',
		skip: number,
		take: number,
		page: number,
		options: VisibilityOptions = {},
	): Promise<PaginatedDto<ProductDto>> {
		const whereSql = await this.buildProductSqlWhere(query, options);
		const direction = order === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;

		const rows = await this.prismaService.$queryRaw<{ id: number }[]>`
			SELECT p.id
			FROM "Product" p
			LEFT JOIN LATERAL (
				SELECT MIN(COALESCE(v."discountPrice", v.price)) AS min_price
				FROM "ProductVariant" v
				WHERE v."productId" = p.id
			) prices ON true
			WHERE ${whereSql}
			ORDER BY prices.min_price ${direction} NULLS LAST, p.id ASC
			LIMIT ${take} OFFSET ${skip}
		`;

		const [products, count] = await Promise.all([
			rows.length ? this.findProductsByIdsInOrder(rows.map((row) => row.id)) : [],
			this.prismaService.product.count({ where: productFilter }),
		]);

		return new PaginatedDto<ProductDto>(products, page, take, count);
	}

	async findProductsByIdsInOrder(ids: number[]) {
		const products = await this.prismaService.product.findMany({
			include: PRODUCT_LIST_INCLUDE,
			where: { id: { in: ids } },
		});
		const productsById = new Map(products.map((product) => [product.id, product]));

		return ids.map((id) => productsById.get(id)).filter((product) => product != null);
	}

	async getRandom({
		category,
		limit,
		includeHidden = false,
	}: {
		category: CategoryDto;
		limit: number;
		includeHidden?: boolean;
	}): Promise<ProductDto[]> {
		try {
			const visibilitySql = includeHidden
				? Prisma.sql`TRUE`
				: Prisma.sql`"isVisible" = true`;

			const rows = await this.prismaService.$queryRaw<{ id: number }[]>`
				SELECT id FROM "Product"
				WHERE "categoryId" = ${category.id}
					AND ${visibilitySql}
				ORDER BY RANDOM()
				LIMIT ${limit}
			`;

			if (!rows.length) return [];

			return await this.prismaService.product.findMany({
				where: { id: { in: rows.map((r) => r.id) } },
				include: PRODUCT_LIST_INCLUDE,
			});
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot get random products');
		}
	}

	async getById(id: number): Promise<ProductDto> {
		const product = await this.prismaService.product.findFirst({
			include: PRODUCT_DETAIL_INCLUDE,
			where: { id },
		});
		if (!product) throw new NotFoundException('Product with this id not found');
		return product;
	}

	async getBySlug(slug: string, options: VisibilityOptions = {}): Promise<ProductDto> {
		const product = await this.prismaService.product.findFirst({
			include: PRODUCT_DETAIL_INCLUDE,
			where: {
				slug,
				...visibleOnlyWhere(options),
			},
		});
		if (!product) throw new NotFoundException('Product with this slug not found');
		return product;
	}

	async getProductWithSeoBySlug(
		slug: string,
		options: VisibilityOptions = {},
	): Promise<ProductWithSeoDto> {
		const product = await this.getBySlug(slug, options);
		const { minPrice, maxPrice } = getProductPriceRange(product.variants);
		const seo = await this.seoService.resolveMetadata(
			SeoEntityType.product,
			product.slug,
			{
				name: product.name,
				category: product.category?.name ?? '',
				minPrice,
				maxPrice,
			},
		);

		return { ...product, seo };
	}
}
