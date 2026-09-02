import {
	ProductQuerySchema,
	ProductSortSchema,
	SEO_TEMPLATE_VARIABLES,
	VariantQuerySchema,
	PaginationQuerySchema,
	AUDIT_ACTIONS,
	AUDIT_ENTITY_TYPES,
	AuditLogListQuerySchema,
	AuditLogListResponseSchema,
	AuditLogParamsSchema,
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

	it('exposes strict audit log constants and cursor query defaults', () => {
		expect(AUDIT_ACTIONS).toContain('products.imported');
		expect(AUDIT_ENTITY_TYPES).toContain('product_import');
		expect(AuditLogListQuerySchema.parse({})).toEqual({ limit: 20 });
		expect(AuditLogListQuerySchema.parse({ limit: '60' }).limit).toBe(60);
		expect(() => AuditLogListQuerySchema.parse({ limit: 61 })).toThrow();
		expect(() =>
			AuditLogListQuerySchema.parse({ action: 'product.published' }),
		).toThrow();
		expect(() =>
			AuditLogListQuerySchema.parse({ entityType: 'order' }),
		).toThrow();
	});

	it('requires a cursor when pagination direction is provided', () => {
		expect(() => AuditLogListQuerySchema.parse({ direction: 'newer' })).toThrow();
	});

	it('rejects an audit date range where from is after to', () => {
		expect(() =>
			AuditLogListQuerySchema.parse({
				from: '2026-09-02T00:00:00.000Z',
				to: '2026-09-01T00:00:00.000Z',
			}),
		).toThrow();
	});

	it('requires audit date filters to use UTC ISO timestamps ending in Z', () => {
		expect(() =>
			AuditLogListQuerySchema.parse({
				from: '2026-09-01T03:00:00+03:00',
			}),
		).toThrow();
	});

	it('validates audit detail params and list responses', () => {
		expect(AuditLogParamsSchema.parse({ id: '42' })).toEqual({ id: 42 });
		expect(() => AuditLogParamsSchema.parse({ id: 0 })).toThrow();
		expect(
			AuditLogListResponseSchema.parse({
				data: [],
				pageInfo: {
					startCursor: null,
					endCursor: null,
					hasNewerPage: false,
					hasOlderPage: false,
				},
			}),
		).toBeDefined();
	});
});
