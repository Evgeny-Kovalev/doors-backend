import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	CollectionCreateSchema,
	CollectionListItemSchema,
	CollectionSchema,
	CollectionUpdateSchema,
} from '@/contracts';

export class CollectionDto extends createZodDto(CollectionSchema) {}
export class CollectionListItemDto extends createZodDto(CollectionListItemSchema) {}
export class CollectionCreateDto extends createZodDto(CollectionCreateSchema) {}
export class CollectionUpdateDto extends createZodDto(CollectionUpdateSchema) {}
