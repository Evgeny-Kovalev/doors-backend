import type { ProductDto } from '../dto/product.dto';

export const getProductPriceRange = (variants: ProductDto['variants']) => {
	const prices = variants
		.map((variant) => variant.discountPrice ?? variant.price)
		.filter((price): price is number => price !== null);

	if (prices.length === 0) {
		return { minPrice: '', maxPrice: '' };
	}

	return {
		minPrice: String(Math.min(...prices)),
		maxPrice: String(Math.max(...prices)),
	};
};

export const DEFAULT_INCLUDE = {
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
};
