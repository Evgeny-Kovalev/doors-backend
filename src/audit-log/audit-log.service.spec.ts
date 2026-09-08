import { AuditLogWriteError } from './audit-log.error';
import { AuditLogService } from './audit-log.service';
import { AuditContextService } from './audit-context.service';
import { encodeAuditLogCursor } from './audit-log.cursor';
import type { PrismaService } from '@/app/prisma/prisma.service';
import type { Prisma } from '@/app/generated/prisma';

describe('AuditLogService', () => {
	const actor = { id: 7, email: 'admin@example.com' };
	const createdAt = new Date('2026-09-01T18:05:00.000Z');

	const auditRow = (
		id: number,
		date = createdAt,
		overrides: Partial<{
			actorId: number | null;
			actorEmail: string | null;
			action: string;
			entityType: string;
			entityId: string;
			entityLabel: string | null;
			entitySlug: string | null;
			batchId: string | null;
			metadata: Record<string, unknown> | null;
		}> = {},
	) => ({
		id,
		createdAt: date,
		actorId: 7,
		actorEmail: 'admin@example.com',
		action: 'product.updated',
		entityType: 'product',
		entityId: '42',
		entityLabel: 'classic',
		entitySlug: 'classic',
		batchId: null,
		metadata: null,
		...overrides,
	});

	const createService = ({
		findMany = jest.fn().mockResolvedValue([]),
		findFirst = jest.fn().mockResolvedValue(null),
		findUnique = jest.fn().mockResolvedValue(null),
	}: {
		findMany?: jest.Mock;
		findFirst?: jest.Mock;
		findUnique?: jest.Mock;
	} = {}) => {
		const prisma = {
			auditLog: { findMany, findFirst, findUnique },
		} as unknown as PrismaService;
		return {
			service: new AuditLogService(prisma, new AuditContextService()),
			findMany,
			findFirst,
		};
	};

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
					entityLabel: 'Classic',
					entitySlug: 'classic',
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
				entityLabel: 'Classic',
				entitySlug: 'classic',
				batchId: undefined,
				metadata: undefined,
			},
		});
	});

	it('converts entityId to string and preserves nullable fields and metadata', async () => {
		const create = jest.fn().mockResolvedValue({ id: 1 });
		const auditContext = new AuditContextService();
		const service = new AuditLogService({} as PrismaService, auditContext);
		const metadata = { source: 'import', importedVariants: 4 };

		await auditContext.run(async () => {
			auditContext.setActor(actor);
			await service.record(
				{ auditLog: { create } } as unknown as Prisma.TransactionClient,
				{
					action: 'products.imported',
					entityType: 'product_import',
					entityId: 123,
					entityLabel: null,
					metadata,
				},
			);
		});

		expect(create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				entityId: '123',
				entityLabel: null,
				entitySlug: undefined,
				batchId: undefined,
				metadata,
			}),
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

	it('keeps an audit failure rollback-compatible with the business transaction', async () => {
		const auditContext = new AuditContextService();
		const create = jest.fn().mockRejectedValue(new Error('audit insert failed'));
		const service = new AuditLogService({} as PrismaService, auditContext);
		let businessMutationRolledBack = false;

		const transaction = async (
			callback: (tx: Prisma.TransactionClient) => Promise<void>,
		) => {
			try {
				await callback({
					auditLog: { create },
				} as unknown as Prisma.TransactionClient);
			} catch (error) {
				businessMutationRolledBack = true;
				throw error;
			}
		};

		await auditContext.run(async () => {
			auditContext.setActor(actor);
			await expect(
				transaction(async (tx) => {
					await service.record(tx, {
						action: 'product.updated',
						entityType: 'product',
						entityId: 42,
					});
				}),
			).rejects.toBeInstanceOf(AuditLogWriteError);
		});
		expect(businessMutationRolledBack).toBe(true);
	});

	it('returns the first page newest-first and uses limit+1', async () => {
		const findMany = jest
			.fn()
			.mockResolvedValue([auditRow(3), auditRow(2), auditRow(1)]);
		const { service } = createService({ findMany });

		const result = await service.findAll({
			limit: 2,
		});

		expect(result.data.map(({ id }) => id)).toEqual([3, 2]);
		expect(result.data[0].createdAt).toBe('2026-09-01T18:05:00.000Z');
		expect(result.pageInfo).toEqual({
			startCursor: encodeAuditLogCursor(auditRow(3)),
			endCursor: encodeAuditLogCursor(auditRow(2)),
			hasNewerPage: false,
			hasOlderPage: true,
		});
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
				take: 3,
			}),
		);
	});

	it('orders equal timestamps by id descending', async () => {
		const findMany = jest.fn().mockResolvedValue([auditRow(2), auditRow(1)]);
		const { service } = createService({ findMany });

		const result = await service.findAll({ limit: 20 });

		expect(result.data.map(({ id }) => id)).toEqual([2, 1]);
		expect(findMany.mock.calls[0][0].orderBy).toEqual([
			{ createdAt: 'desc' },
			{ id: 'desc' },
		]);
	});

	it('returns an older page and reports both navigation directions', async () => {
		const findMany = jest.fn().mockResolvedValue([auditRow(2), auditRow(1)]);
		const findFirst = jest.fn().mockResolvedValue({ id: 3 });
		const { service } = createService({ findMany, findFirst });
		const cursor = encodeAuditLogCursor(auditRow(3));

		const result = await service.findAll({ limit: 2, cursor, direction: 'older' });

		expect(result.data.map(({ id }) => id)).toEqual([2, 1]);
		expect(result.pageInfo.hasNewerPage).toBe(true);
		expect(result.pageInfo.hasOlderPage).toBe(false);
		expect(findMany.mock.calls[0][0].where.AND[1]).toEqual({
			OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: 3 } }],
		});
	});

	it('queries newer rows ascending but returns the nearest page descending', async () => {
		const findMany = jest
			.fn()
			.mockResolvedValue([auditRow(3), auditRow(4), auditRow(5)]);
		const findFirst = jest.fn().mockResolvedValue({ id: 2 });
		const { service } = createService({ findMany, findFirst });

		const result = await service.findAll({
			limit: 2,
			cursor: encodeAuditLogCursor(auditRow(2)),
			direction: 'newer',
		});

		expect(result.data.map(({ id }) => id)).toEqual([4, 3]);
		expect(result.pageInfo.hasNewerPage).toBe(true);
		expect(result.pageInfo.hasOlderPage).toBe(true);
		expect(findMany.mock.calls[0][0].orderBy).toEqual([
			{ createdAt: 'asc' },
			{ id: 'asc' },
		]);
	});

	it('does not include a newly inserted row in the next older page', async () => {
		const findMany = jest
			.fn()
			.mockResolvedValueOnce([auditRow(3), auditRow(2), auditRow(1)])
			.mockResolvedValueOnce([auditRow(1)]);
		const { service } = createService({ findMany });

		const first = await service.findAll({ limit: 2 });
		const older = await service.findAll({
			limit: 2,
			cursor: first.pageInfo.endCursor!,
			direction: 'older',
		});

		expect(first.data.map(({ id }) => id)).toEqual([3, 2]);
		expect(older.data.map(({ id }) => id)).toEqual([1]);
		expect(findMany.mock.calls[1][0].where.AND[1].OR[1]).toEqual({
			createdAt,
			id: { lt: 2 },
		});
	});

	it('combines all filters with inclusive date boundaries', async () => {
		const findMany = jest.fn().mockResolvedValue([]);
		const { service } = createService({ findMany });
		const from = '2026-09-01T00:00:00.000Z';
		const to = '2026-09-02T00:00:00.000Z';

		await service.findAll({
			limit: 20,
			entityType: 'product',
			entityId: '42',
			actorId: 7,
			actorEmail: 'admin@example.com',
			action: 'product.updated',
			batchId: 'fd4e8935-7b12-42cb-956c-a8461a9f70bf',
			from,
			to,
		});

		expect(findMany.mock.calls[0][0].where).toEqual({
			entityType: 'product',
			entityId: '42',
			actorId: 7,
			actorEmail: 'admin@example.com',
			action: 'product.updated',
			batchId: 'fd4e8935-7b12-42cb-956c-a8461a9f70bf',
			createdAt: {
				gte: new Date(from),
				lte: new Date(to),
			},
		});
	});

	it('rejects a malformed cursor as a bad request', async () => {
		const { service, findMany } = createService();

		await expect(
			service.findAll({ limit: 20, cursor: 'not*base64', direction: 'older' }),
		).rejects.toMatchObject({ status: 400 });
		expect(findMany).not.toHaveBeenCalled();
	});

	it('returns null cursors and accurate flags for an empty page', async () => {
		const { service } = createService();

		const result = await service.findAll({ limit: 20 });

		expect(result).toEqual({
			data: [],
			pageInfo: {
				startCursor: null,
				endCursor: null,
				hasNewerPage: false,
				hasOlderPage: false,
			},
		});
	});

	it('gets an event by id with nullable values', async () => {
		const row = auditRow(9, createdAt, {
			actorId: null,
			actorEmail: null,
			entityLabel: null,
			entitySlug: null,
			metadata: { imported: 12 },
		});
		const findUnique = jest.fn().mockResolvedValue(row);
		const { service } = createService({ findUnique });

		await expect(service.findOne(9)).resolves.toEqual({
			...row,
			createdAt: createdAt.toISOString(),
		});
		expect(findUnique).toHaveBeenCalledWith({ where: { id: 9 } });
	});

	it('returns 404 when an event does not exist', async () => {
		const { service } = createService();
		await expect(service.findOne(404)).rejects.toMatchObject({ status: 404 });
	});
});
