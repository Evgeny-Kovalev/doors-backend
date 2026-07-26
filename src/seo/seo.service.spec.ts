import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SeoService } from './seo.service';
import { PrismaService } from '@/app/prisma/prisma.service';
import { SeoEntityType } from '@/app/generated/prisma';

describe('SeoService', () => {
	let service: SeoService;
	const prisma = {
		seoTemplate: {
			findUniqueOrThrow: jest.fn(),
			update: jest.fn(),
		},
		seoMetadata: {
			findUnique: jest.fn(),
		},
	};

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [SeoService, { provide: PrismaService, useValue: prisma }],
		}).compile();

		service = module.get(SeoService);
	});

	it('prefers metadata override over template', async () => {
		prisma.seoTemplate.findUniqueOrThrow.mockResolvedValue({
			entityType: SeoEntityType.product,
			titleTemplate: '{{name}} — {{category}}',
			descriptionTemplate: 'From {{minPrice}}',
		});
		prisma.seoMetadata.findUnique.mockResolvedValue({
			title: 'Custom title',
			description: 'Custom description',
		});

		const result = await service.resolveMetadata(SeoEntityType.product, 'product', {
			name: 'Product name',
			category: 'Category name',
			minPrice: '100',
			maxPrice: '200',
		});

		expect(result).toEqual({
			title: 'Custom title',
			description: 'Custom description',
		});
	});

	it('falls back to rendered template and strategy title', async () => {
		prisma.seoTemplate.findUniqueOrThrow.mockResolvedValue({
			entityType: SeoEntityType.product,
			titleTemplate: '',
			descriptionTemplate: 'Price from {{minPrice}}',
		});
		prisma.seoMetadata.findUnique.mockResolvedValue(null);

		const result = await service.resolveMetadata(SeoEntityType.product, 'product', {
			name: 'Product name',
			category: 'Category name',
			minPrice: '100',
			maxPrice: '200',
		});

		expect(result).toEqual({
			title: 'Product name',
			description: 'Price from 100',
		});
	});

	it('rejects unknown template variables on update', async () => {
		await expect(
			service.updateTemplate(SeoEntityType.category, {
				titleTemplate: '{{unknown}}',
				descriptionTemplate: '{{name}}',
			}),
		).rejects.toBeInstanceOf(BadRequestException);
	});
});
