import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuditLogSchema, type AuditAction, type AuditEntityType } from '@/contracts';
import { Prisma } from '@/app/generated/prisma';
import { PrismaService } from '@/app/prisma/prisma.service';
import { AuditContextService } from './audit-context.service';
import {
	AuditLogCursorError,
	decodeAuditLogCursor,
	encodeAuditLogCursor,
	type AuditLogCursor,
} from './audit-log.cursor';
import { AuditLogWriteError } from './audit-log.error';
import type {
	AuditLogDto,
	AuditLogListQueryDto,
	AuditLogListResponseDto,
} from './dto';

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

	async findAll(query: AuditLogListQueryDto): Promise<AuditLogListResponseDto> {
		const { limit, cursor, direction = 'older', from, to, ...filters } = query;
		const baseWhere: Prisma.AuditLogWhereInput = {
			...filters,
			createdAt:
				from || to
					? {
							gte: from ? new Date(from) : undefined,
							lte: to ? new Date(to) : undefined,
						}
					: undefined,
		};

		let decodedCursor: AuditLogCursor | undefined;
		if (cursor) {
			try {
				decodedCursor = decodeAuditLogCursor(cursor);
			} catch (error) {
				if (error instanceof AuditLogCursorError) {
					throw new BadRequestException('Invalid audit log cursor');
				}
				throw error;
			}
		}

		const requestedBoundary = decodedCursor
			? this.cursorBoundary(decodedCursor, direction)
			: undefined;
		const rows = await this.prisma.auditLog.findMany({
			where: requestedBoundary
				? { AND: [baseWhere, requestedBoundary] }
				: baseWhere,
			orderBy:
				direction === 'newer'
					? [{ createdAt: 'asc' }, { id: 'asc' }]
					: [{ createdAt: 'desc' }, { id: 'desc' }],
			take: limit + 1,
		});

		const hasPageInRequestedDirection = rows.length > limit;
		const pageRows = rows.slice(0, limit);
		if (direction === 'newer') pageRows.reverse();

		const data = pageRows.map((row) => this.toDto(row));
		const startCursor = pageRows[0] ? encodeAuditLogCursor(pageRows[0]) : null;
		const lastRow = pageRows[pageRows.length - 1];
		const endCursor = lastRow ? encodeAuditLogCursor(lastRow) : null;

		let hasNewerPage = false;
		let hasOlderPage = hasPageInRequestedDirection;

		if (decodedCursor) {
			if (direction === 'older') {
				const anchor = pageRows[0] ?? decodedCursor;
				hasNewerPage = await this.existsAcrossBoundary(baseWhere, anchor, 'newer');
			} else {
				const anchor = lastRow ?? decodedCursor;
				hasNewerPage = hasPageInRequestedDirection;
				hasOlderPage = await this.existsAcrossBoundary(baseWhere, anchor, 'older');
			}
		}

		return {
			data,
			pageInfo: {
				startCursor,
				endCursor,
				hasNewerPage,
				hasOlderPage,
			},
		};
	}

	async findOne(id: number): Promise<AuditLogDto> {
		const row = await this.prisma.auditLog.findUnique({ where: { id } });
		if (!row) throw new NotFoundException('Audit log event not found');
		return this.toDto(row);
	}

	createBatchId(): string {
		return randomUUID();
	}

	private cursorBoundary(
		cursor: AuditLogCursor,
		direction: 'older' | 'newer',
	): Prisma.AuditLogWhereInput {
		const dateOperator = direction === 'older' ? 'lt' : 'gt';
		return {
			OR: [
				{ createdAt: { [dateOperator]: cursor.createdAt } },
				{
					createdAt: cursor.createdAt,
					id: { [dateOperator]: cursor.id },
				},
			],
		};
	}

	private async existsAcrossBoundary(
		baseWhere: Prisma.AuditLogWhereInput,
		cursor: AuditLogCursor,
		direction: 'older' | 'newer',
	): Promise<boolean> {
		const row = await this.prisma.auditLog.findFirst({
			where: { AND: [baseWhere, this.cursorBoundary(cursor, direction)] },
			select: { id: true },
		});
		return Boolean(row);
	}

	private toDto(row: {
		id: number;
		createdAt: Date;
		actorId: number | null;
		actorEmail: string | null;
		action: string;
		entityType: string;
		entityId: string;
		entityLabel: string | null;
		batchId: string | null;
		metadata: Prisma.JsonValue | null;
	}): AuditLogDto {
		return AuditLogSchema.parse({
			...row,
			createdAt: row.createdAt.toISOString(),
		});
	}
}
