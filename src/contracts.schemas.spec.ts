import {
	ProductQuerySchema,
	ProductSortSchema,
	SEO_TEMPLATE_VARIABLES,
	VariantQuerySchema,
	PaginationQuerySchema,
} from '../contracts';

describe('api contracts', () => {
	it('parses productTypes from comma-separated string', () => {
		const result = ProductQuerySchema.parse({
			productTypes: 'full,fullSample',
			sort: 'price',
			order: 'desc',
		});

		expect(result.productTypes).toEqual(['full', 'fullSample']);
		expect(result.sort).toBe('price');
		expect(result.order).toBe('desc');
	});

	it('applies product query defaults', () => {
		const result = ProductQuerySchema.parse({});
		expect(result.sort).toBe('default');
		expect(result.order).toBe('asc');
	});

	it('rejects invalid product sort', () => {
		expect(() => ProductSortSchema.parse('popularity')).toThrow();
	});

	it('coerces variant productId from query string', () => {
		expect(VariantQuerySchema.parse({ productId: '42' })).toEqual({ productId: 42 });
	});

	it('caps pagination limit at 60', () => {
		expect(() => PaginationQuerySchema.parse({ page: 1, limit: 61 })).toThrow();
		expect(PaginationQuerySchema.parse({ page: 1, limit: 60 }).limit).toBe(60);
	});

	it('exposes SEO template variables per entity', () => {
		expect(SEO_TEMPLATE_VARIABLES.product).toEqual([
			'name',
			'category',
			'minPrice',
			'maxPrice',
		]);
		expect(SEO_TEMPLATE_VARIABLES.category).toEqual(['name']);
	});
});
