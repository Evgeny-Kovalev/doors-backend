import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuditLogSchema, type AuditAction, type AuditEntityType } from '@/contracts';
import { Prisma } from '@/app/generated/prisma';
import { PrismaService } from '@/app/prisma/prisma.service';
import { PaginatedDto } from '@/app/shared/pagination/dto';
import { AuditContextService } from './audit-context.service';
import { AuditLogWriteError } from './audit-log.error';
import type { AuditLogDto, AuditLogQueryDto } from './dto';

export type AuditEventInput = {
	action: AuditAction;
	entityType: AuditEntityType;
	entityId: string | number;
	entityLabel?: string | null;
	batchId?: string;
	metadata?: Prisma.InputJsonObject;
};

@Injectable()
export class AuditLogService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly auditContext: AuditContextService,
	) {}

	async record(tx: Prisma.TransactionClient, event: AuditEventInput): Promise<void> {
		try {
			const actor = this.auditContext.getActor();
			await tx.auditLog.create({
				data: {
					actorId: actor.id,
					actorEmail: actor.email,
					action: event.action,
					entityType: event.entityType,
					entityId: event.entityId.toString(),
					entityLabel: event.entityLabel,
					batchId: event.batchId,
					metadata: event.metadata,
				},
			});
		} catch (error) {
			throw new AuditLogWriteError(error);
		}
	}

	async findAll(query: AuditLogQueryDto): Promise<PaginatedDto<AuditLogDto>> {
		const { page, limit, from, to, ...filters } = query;
		const where: Prisma.AuditLogWhereInput = {
			...filters,
			createdAt:
				from || to
					? {
							gte: from ? new Date(from) : undefined,
							lte: to ? new Date(to) : undefined,
						}
					: undefined,
		};

		const [rows, count] = await this.prisma.$transaction([
			this.prisma.auditLog.findMany({
				where,
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
				skip: (page - 1) * limit,
				take: limit,
			}),
			this.prisma.auditLog.count({ where }),
		]);

		const data = rows.map((row) =>
			AuditLogSchema.parse({
				...row,
				createdAt: row.createdAt.toISOString(),
			}),
		);
		return new PaginatedDto(data, page, limit, count);
	}

	createBatchId(): string {
		return randomUUID();
	}
}
