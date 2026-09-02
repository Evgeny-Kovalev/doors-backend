import { AuditContextService } from './audit-context.service';

describe('AuditContextService', () => {
	it('keeps actors isolated between concurrent requests', async () => {
		const context = new AuditContextService();

		const readActor = (id: number) =>
			context.run(async () => {
				context.setActor({ id, email: `admin-${id}@example.com` });
				await Promise.resolve();
				return context.getActor();
			});

		const [first, second] = await Promise.all([readActor(1), readActor(2)]);

		expect(first.id).toBe(1);
		expect(second.id).toBe(2);
	});

	it('rejects audit access outside an initialized authenticated request', () => {
		const context = new AuditContextService();
		expect(() => context.getActor()).toThrow('Audit actor is not available');
	});
});
