import { createZodDto } from 'nestjs-zod';
import { CollectionCreateSchema, CollectionSchema } from '../../../contracts';

export class CollectionDto extends createZodDto(CollectionSchema) {}
export class CollectionCreateDto extends createZodDto(CollectionCreateSchema) {}
