import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto, PaginatedAuditLogDto } from './dto';

@ApiTags('Audit Log')
@Controller({
	path: 'audit-logs',
	version: '1',
})
export class AuditLogController {
	constructor(private readonly auditLogService: AuditLogService) {}

	@Admin()
	@Get('/')
	@ApiOkResponse({ type: PaginatedAuditLogDto })
	findAll(@Query() query: AuditLogQueryDto): Promise<PaginatedAuditLogDto> {
		return this.auditLogService.findAll(query);
	}
}
