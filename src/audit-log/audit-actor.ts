import type { JwtPayload } from '@/app/auth/types';

export type AuditActor = {
	id: number;
	email: string;
};

export const toAuditActor = (user: JwtPayload): AuditActor => ({
	id: user.sub,
	email: user.email,
});
