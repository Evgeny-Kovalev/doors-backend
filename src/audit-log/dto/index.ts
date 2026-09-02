import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	AuditLogListQuerySchema,
	AuditLogListResponseSchema,
	AuditLogParamsSchema,
	AuditLogSchema,
} from '@/contracts';

export class AuditLogDto extends createZodDto(AuditLogSchema) {}
export class AuditLogListQueryDto extends createZodDto(AuditLogListQuerySchema) {}
export class AuditLogListResponseDto extends createZodDto(AuditLogListResponseSchema) {}
export class AuditLogParamsDto extends createZodDto(AuditLogParamsSchema) {}
