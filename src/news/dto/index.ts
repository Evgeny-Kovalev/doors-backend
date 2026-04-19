import { createZodDto } from 'nestjs-zod';
import { NewsPreviewApiSchema } from '../../../contracts';

export class NewsPreviewDto extends createZodDto(NewsPreviewApiSchema) {}
