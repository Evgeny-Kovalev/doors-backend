import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';

export class CategoryDto implements Category {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	imgUrl: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	isVisible: boolean;

	@ApiProperty({ nullable: true })
	parentCategoryId: number | null;
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

	@ApiProperty({ example: 'New Product image path' })
	imgUrl?: string;

	@ApiProperty({ example: 'New Product desc' })
	description?: string;

	@ApiProperty({ example: false })
	isVisible?: boolean;

	@ApiProperty({ nullable: true, example: null })
	parentId?: number | null;
}
