import { SeoEntityType } from '@/app/generated/prisma';

import type { SeoResolverRegistry, SeoResolverStrategy } from './types';

const productSeoStrategy: SeoResolverStrategy<'product'> = {
	buildVariables: (values) => ({
		name: values.name,
		category: values.category,
		minPrice: values.minPrice,
		maxPrice: values.maxPrice,
	}),
	fallbackTitle: (values) => values.name,
};

const categorySeoStrategy: SeoResolverStrategy<'category'> = {
	buildVariables: (values) => ({
		name: values.name,
	}),
	fallbackTitle: (values) => values.name,
};

export const SEO_RESOLVER_REGISTRY: SeoResolverRegistry = {
	[SeoEntityType.product]: productSeoStrategy,
	[SeoEntityType.category]: categorySeoStrategy,
};
