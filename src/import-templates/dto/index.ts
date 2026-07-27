import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	ImportTemplateCreateSchema,
	ImportTemplateSchema,
	ImportTemplateUpdateSchema,
} from '@/contracts';

export class ImportTemplateDto extends createZodDto(ImportTemplateSchema) {}
export class ImportTemplateCreateDto extends createZodDto(ImportTemplateCreateSchema) {}
export class ImportTemplateUpdateDto extends createZodDto(ImportTemplateUpdateSchema) {}
