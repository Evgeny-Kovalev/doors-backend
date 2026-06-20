import { createZodDto } from '@/app/shared/create-zod-dto';
import { NewsPreviewApiSchema } from '@/contracts';

export class NewsPreviewDto extends createZodDto(NewsPreviewApiSchema) {}
