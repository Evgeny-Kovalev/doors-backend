import { z } from 'zod';

const AuditLogCursorPayloadSchema = z
	.object({
		version: z.literal(1),
		createdAt: z.iso.datetime({ offset: false }),
		id: z.number().int().positive(),
	})
	.strict();

export type AuditLogCursor = {
	createdAt: Date;
	id: number;
};

export class AuditLogCursorError extends Error {
	constructor() {
		super('Invalid audit log cursor');
		this.name = AuditLogCursorError.name;
	}
}

export const encodeAuditLogCursor = ({ createdAt, id }: AuditLogCursor): string =>
	Buffer.from(
		JSON.stringify({
			version: 1,
			createdAt: createdAt.toISOString(),
			id,
		}),
	).toString('base64url');

export const decodeAuditLogCursor = (cursor: string): AuditLogCursor => {
	try {
		if (!/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error('Invalid base64url');

		const decoded = Buffer.from(cursor, 'base64url');
		if (decoded.toString('base64url') !== cursor) throw new Error('Non-canonical base64url');

		const payload = AuditLogCursorPayloadSchema.parse(JSON.parse(decoded.toString('utf8')));
		return {
			createdAt: new Date(payload.createdAt),
			id: payload.id,
		};
	} catch {
		throw new AuditLogCursorError();
	}
};
