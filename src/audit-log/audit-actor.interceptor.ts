import {
	Injectable,
	type CallHandler,
	type ExecutionContext,
	type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Request } from 'express';
import type { JwtPayload } from '@/app/auth/types';
import { AuditContextService } from './audit-context.service';
import { toAuditActor } from './audit-actor';

@Injectable()
export class AuditActorInterceptor implements NestInterceptor {
	constructor(private readonly auditContext: AuditContextService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<Request>();
		const user = request.user as JwtPayload | undefined;
		if (user) this.auditContext.setActor(toAuditActor(user));
		return next.handle();
	}
}
