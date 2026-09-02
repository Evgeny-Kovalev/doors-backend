import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuditContextService } from './audit-context.service';

@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
	constructor(private readonly auditContext: AuditContextService) {}

	use(_request: Request, _response: Response, next: NextFunction): void {
		this.auditContext.run(() => next());
	}
}
