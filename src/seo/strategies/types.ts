import type { SeoEntityType, SeoTemplateVariables } from '@/contracts';

export interface SeoResolverStrategy<T extends SeoEntityType> {
	buildVariables(values: SeoTemplateVariables<T>): SeoTemplateVariables<T>;
	fallbackTitle(values: SeoTemplateVariables<T>): string;
}

export type SeoResolverRegistry = {
	[K in SeoEntityType]: SeoResolverStrategy<K>;
};
