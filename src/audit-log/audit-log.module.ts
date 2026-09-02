import { Global, MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditActorInterceptor } from './audit-actor.interceptor';
import { AuditContextMiddleware } from './audit-context.middleware';
import { AuditContextService } from './audit-context.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

@Global()
@Module({
	controllers: [AuditLogController],
	providers: [
		AuditContextService,
		AuditContextMiddleware,
		AuditLogService,
		{
			provide: APP_INTERCEPTOR,
			useClass: AuditActorInterceptor,
		},
	],
	exports: [AuditContextService, AuditLogService],
})
export class AuditLogModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(AuditContextMiddleware).forRoutes('*path');
	}
}
