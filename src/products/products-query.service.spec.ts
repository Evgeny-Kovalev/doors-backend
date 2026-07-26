import { Test, TestingModule } from '@nestjs/testing';
import { ProductsQueryService } from './services/products-query.service';
import { PrismaService } from '@/app/prisma/prisma.service';
import { CategoriesService } from '@/app/categories/categories.service';
import { SeoService } from '@/app/seo/seo.service';
import { NotFoundException } from '@nestjs/common';
import type { ProductQueryParsed } from '@/contracts';

describe('ProductsQueryService', () => {
	let service: ProductsQueryService;
	const prisma = {
		product: {
			findFirst: jest.fn(),
			findMany: jest.fn(),
			count: jest.fn(),
		},
		$transaction: jest.fn(),
		$queryRaw: jest.fn(),
	};
	const categoriesService = {
		getDescendantCategoryIdsBySlug: jest.fn(),
	};
	const seoService = {
		resolveMetadata: jest.fn(),
	};

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProductsQueryService,
				{ provide: PrismaService, useValue: prisma },
				{ provide: CategoriesService, useValue: categoriesService },
				{ provide: SeoService, useValue: seoService },
			],
		}).compile();

		service = module.get(ProductsQueryService);
	});

	it('filters to visible products by default', async () => {
		categoriesService.getDescendantCategoryIdsBySlug.mockResolvedValue([1, 2]);

		const filter = await service.buildProductFilter({
			categorySlug: 'interior',
			q: 'test query',
			productTypes: ['full'],
			sort: 'default',
			order: 'asc',
		});

		expect(filter).toEqual({
			isVisible: true,
			name: { contains: 'test query', mode: 'insensitive' },
			productType: { in: ['full'] },
			categoryId: { in: [1, 2] },
		});
	});

	it('includes hidden products when includeHidden is set', async () => {
		const filter = await service.buildProductFilter(
			{ sort: 'default', order: 'asc' },
			{ includeHidden: true },
		);

		expect(filter.isVisible).toBeUndefined();
	});

	it('throws NotFound when product slug is missing', async () => {
		prisma.product.findFirst.mockResolvedValue(null);
		await expect(service.getBySlug('missing')).rejects.toBeInstanceOf(
			NotFoundException,
		);
	});

	it('sorts by name via prisma transaction', async () => {
		prisma.$transaction.mockResolvedValue([
			[{ id: 1, name: 'Alpha', variants: [] }],
			1,
		]);

		const query: ProductQueryParsed = { sort: 'name', order: 'asc' };
		const result = await service.getAll(query, { page: 1, limit: 10 });

		expect(prisma.$transaction).toHaveBeenCalled();
		expect(result.meta.itemCount).toBe(1);
		expect(result.data).toHaveLength(1);
	});
});
