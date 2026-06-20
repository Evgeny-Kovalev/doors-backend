import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	CollectionCreateSchema,
	CollectionSchema,
	CollectionUpdateSchema,
} from '@/contracts';

export class CollectionDto extends createZodDto(CollectionSchema) {}
export class CollectionCreateDto extends createZodDto(CollectionCreateSchema) {}
export class CollectionUpdateDto extends createZodDto(CollectionUpdateSchema) {}
