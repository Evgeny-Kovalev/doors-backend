export class AuditLogWriteError extends Error {
	readonly cause: unknown;

	constructor(cause: unknown) {
		super('Failed to persist audit log');
		this.name = AuditLogWriteError.name;
		this.cause = cause;
	}
}
