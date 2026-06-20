import { createZodDto } from '@/app/shared/create-zod-dto';
import { TagCreateSchema, TagSchema, TagUpdateSchema } from '@/contracts';

export class TagDto extends createZodDto(TagSchema) {}
export class TagCreateDto extends createZodDto(TagCreateSchema) {}
export class TagUpdateDto extends createZodDto(TagUpdateSchema) {}
