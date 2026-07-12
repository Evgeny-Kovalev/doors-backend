import {
	SeoMetadataSchema,
	ResolvedSeoMetadataSchema,
	SeoTemplateSchema,
	SeoTemplateUpdateSchema,
} from '@/contracts';
import { createZodDto } from '@/app/shared/create-zod-dto';

export class SeoTemplateDto extends createZodDto(SeoTemplateSchema) {}
export class SeoTemplateUpdateDto extends createZodDto(SeoTemplateUpdateSchema) {}

export class SeoMetadataDto extends createZodDto(SeoMetadataSchema) {}
export class SeoMetadataUpdateDto extends createZodDto(SeoMetadataSchema) {}
export class ResolvedSeoMetadataDto extends createZodDto(ResolvedSeoMetadataSchema) {}
