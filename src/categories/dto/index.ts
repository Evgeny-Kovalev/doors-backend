import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	CategorySchema,
	CategoryCreateSchema,
	CategoryUpdateSchema,
	CategoryQuerySchema,
	CategoryWithSeoSchema,
} from '@/contracts';

export class CategoryDto extends createZodDto(CategorySchema) {}
export class CategoryWithSeoDto extends createZodDto(CategoryWithSeoSchema) {}
export class CategoryCreateDto extends createZodDto(CategoryCreateSchema) {}
export class CategoryUpdateDto extends createZodDto(CategoryUpdateSchema) {}
export class CategoryQueryDto extends createZodDto(CategoryQuerySchema) {}
