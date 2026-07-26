import { Prisma } from '@/app/generated/prisma';

// Full product graph for detail/SEO responses
export const PRODUCT_DETAIL_INCLUDE = {
	category: true,
	params: { include: { key: true, value: true } },
	variants: {
		include: {
			attributes: {
				include: {
					key: true,
					value: true,
				},
			},
			tags: true,
		},
	},
} as const satisfies Prisma.ProductInclude;

// List responses: same shape as ProductSchema, kept as a named alias for clarity
export const PRODUCT_LIST_INCLUDE = PRODUCT_DETAIL_INCLUDE;

export const VARIANT_INCLUDE = {
	attributes: { include: { key: true, value: true } },
	tags: true,
} as const satisfies Prisma.ProductVariantInclude;

// Collections list: slim products without variants/params trees
export const COLLECTION_LIST_INCLUDE = {
	categories: true,
	products: {
		where: { isVisible: true },
		include: {
			category: true,
		},
	},
} as const satisfies Prisma.CollectionInclude;

// Same as list, but includes hidden products (admin)
export const COLLECTION_LIST_INCLUDE_WITH_HIDDEN = {
	categories: true,
	products: {
		include: {
			category: true,
		},
	},
} as const satisfies Prisma.CollectionInclude;

export const COLLECTION_DETAIL_INCLUDE = {
	categories: true,
	products: {
		where: { isVisible: true },
		include: PRODUCT_DETAIL_INCLUDE,
	},
} as const satisfies Prisma.CollectionInclude;

// Admin create/update responses - include hidden products too
export const COLLECTION_ADMIN_INCLUDE = {
	categories: true,
	products: {
		include: PRODUCT_DETAIL_INCLUDE,
	},
} as const satisfies Prisma.CollectionInclude;
