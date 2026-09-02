import {
	AuditLogCursorError,
	decodeAuditLogCursor,
	encodeAuditLogCursor,
} from './audit-log.cursor';

describe('audit log cursor codec', () => {
	it('round-trips createdAt and id through opaque base64url', () => {
		const value = {
			createdAt: new Date('2026-09-01T18:05:00.000Z'),
			id: 42,
		};

		const encoded = encodeAuditLogCursor(value);

		expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(decodeAuditLogCursor(encoded)).toEqual(value);
	});

	it.each([
		{
			reason: 'invalid base64url characters',
			cursor: 'not*base64url',
		},
		{
			reason: 'non-JSON payload',
			cursor: Buffer.from('not-json').toString('base64url'),
		},
		{
			reason: 'unsupported version',
			cursor: Buffer.from(
				JSON.stringify({
					version: 2,
					createdAt: '2026-09-01T18:05:00.000Z',
					id: 42,
				}),
			).toString('base64url'),
		},
		{
			reason: 'invalid createdAt',
			cursor: Buffer.from(
				JSON.stringify({
					version: 1,
					createdAt: 'not-a-date',
					id: 42,
				}),
			).toString('base64url'),
		},
		{
			reason: 'non-positive id',
			cursor: Buffer.from(
				JSON.stringify({
					version: 1,
					createdAt: '2026-09-01T18:05:00.000Z',
					id: 0,
				}),
			).toString('base64url'),
		},
	])('rejects cursor with $reason', ({ cursor }) => {
		expect(() => decodeAuditLogCursor(cursor)).toThrow(AuditLogCursorError);
	});
});
