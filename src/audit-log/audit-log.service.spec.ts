import { AuditLogWriteError } from './audit-log.error';
import { AuditLogService } from './audit-log.service';
import { AuditContextService } from './audit-context.service';
import type { PrismaService } from '@/app/prisma/prisma.service';
import type { Prisma } from '@/app/generated/prisma';

describe('AuditLogService', () => {
	const actor = { id: 7, email: 'admin@example.com' };

	it('writes an attributed event through the provided transaction', async () => {
		const create = jest.fn().mockResolvedValue({ id: 1 });
		const auditContext = new AuditContextService();
		const service = new AuditLogService({} as PrismaService, auditContext);

		await auditContext.run(async () => {
			auditContext.setActor(actor);

			await service.record(
				{ auditLog: { create } } as unknown as Prisma.TransactionClient,
				{
					action: 'product.updated',
					entityType: 'product',
					entityId: 42,
					entityLabel: 'classic',
				},
			);
		});

		expect(create).toHaveBeenCalledWith({
			data: {
				actorId: 7,
				actorEmail: 'admin@example.com',
				action: 'product.updated',
				entityType: 'product',
				entityId: '42',
				entityLabel: 'classic',
				batchId: undefined,
				metadata: undefined,
			},
		});
	});

	it('wraps write failures so command services can preserve a 500 response', async () => {
		const auditContext = new AuditContextService();
		const service = new AuditLogService({} as PrismaService, auditContext);
		const tx = {
			auditLog: { create: jest.fn().mockRejectedValue(new Error('db unavailable')) },
		} as unknown as Prisma.TransactionClient;

		await auditContext.run(async () => {
			auditContext.setActor(actor);

			await expect(
				service.record(tx, {
					action: 'tag.deleted',
					entityType: 'tag',
					entityId: 3,
				}),
			).rejects.toBeInstanceOf(AuditLogWriteError);
		});
	});

	it('returns newest events with filters and wire-format timestamps', async () => {
		const createdAt = new Date('2026-09-01T18:05:00.000Z');
		const findMany = jest.fn().mockResolvedValue([
			{
				id: 2,
				createdAt,
				actorId: 7,
				actorEmail: 'admin@example.com',
				action: 'product.updated',
				entityType: 'product',
				entityId: '42',
				entityLabel: 'classic',
				batchId: null,
				metadata: null,
			},
		]);
		const count = jest.fn().mockResolvedValue(1);
		const prisma = {
			auditLog: { findMany, count },
			$transaction: jest.fn((queries: Promise<unknown>[]) => Promise.all(queries)),
		} as unknown as PrismaService;
		const service = new AuditLogService(prisma, new AuditContextService());

		const result = await service.findAll({
			page: 1,
			limit: 20,
			entityType: 'product',
			actorId: 7,
		});

		expect(result.data[0].createdAt).toBe('2026-09-01T18:05:00.000Z');
		expect(result.meta.itemCount).toBe(1);
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ entityType: 'product', actorId: 7 }),
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			}),
		);
	});
});
