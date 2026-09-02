import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	AuditLogQuerySchema,
	AuditLogSchema,
	PaginatedAuditLogSchema,
} from '@/contracts';

export class AuditLogDto extends createZodDto(AuditLogSchema) {}
export class AuditLogQueryDto extends createZodDto(AuditLogQuerySchema) {}
export class PaginatedAuditLogDto extends createZodDto(PaginatedAuditLogSchema) {}
