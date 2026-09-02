import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { AuditLogService } from './audit-log.service';
import {
	AuditLogDto,
	AuditLogListQueryDto,
	AuditLogListResponseDto,
	AuditLogParamsDto,
} from './dto';

@ApiTags('Audit Log')
@Controller({
	path: 'audit-logs',
	version: '1',
})
export class AuditLogController {
	constructor(private readonly auditLogService: AuditLogService) {}

	@Admin()
	@Get('/')
	@ApiOkResponse({ type: AuditLogListResponseDto })
	findAll(@Query() query: AuditLogListQueryDto): Promise<AuditLogListResponseDto> {
		return this.auditLogService.findAll(query);
	}

	@Admin()
	@Get(':id')
	@ApiOkResponse({ type: AuditLogDto })
	@ApiNotFoundResponse({ description: 'Audit log event not found' })
	findOne(@Param() { id }: AuditLogParamsDto): Promise<AuditLogDto> {
		return this.auditLogService.findOne(id);
	}
}
