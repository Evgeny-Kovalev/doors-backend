import { CategoryType } from 'src/products/types';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	slug: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	imgUrl: string;

	@ApiProperty()
	categoryType: CategoryType;

	@ApiProperty()
	description: string;

	@ApiProperty()
	isVisible: boolean;

	@ApiProperty({ nullable: true })
	parentCategoryId: number | null;
}

export class CategoryWithSubCategories extends CategoryDto {
	@ApiProperty({ type: [CategoryDto] })
	children: CategoryWithSubCategories[];
}

export class CategoryCreateDto {
	@ApiProperty({ example: 'test category name' })
	name: string;

	@ApiProperty({ example: 'test image path' })
	imgUrl: string;

	@ApiProperty({ example: 'test product desc' })
	description: string;

	@ApiProperty({ example: false })
	isVisible?: boolean;

	@ApiProperty({ nullable: true, example: 2 })
	parentId: number | null;
}

export class CategoryUpdateDto {
	@ApiProperty({ example: 'New Product name' })
	name?: string;

	@ApiProperty({ example: 'slug' })
	slug?: string;

	@ApiProperty({ example: 'New Product image path' })
	imgUrl?: string;

	@ApiProperty({ example: 'New Product desc' })
	description?: string;

	@ApiProperty({ example: false })
	isVisible?: boolean;

	@ApiProperty({ nullable: true, example: null })
	parentId?: number | null;
}
