import { createZodDto } from 'nestjs-zod';
import {
	CategorySchema,
	CategoryWithSubCategoriesSchema,
	CategoryCreateSchema,
	CategoryUpdateSchema,
} from '../../../contracts';

export class CategoryDto extends createZodDto(CategorySchema) {}
export class CategoryWithSubCategories extends createZodDto(
	CategoryWithSubCategoriesSchema,
) {}
export class CategoryCreateDto extends createZodDto(CategoryCreateSchema) {}
export class CategoryUpdateDto extends createZodDto(CategoryUpdateSchema) {}
