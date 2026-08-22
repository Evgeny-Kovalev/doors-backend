import { Role } from '@/app/generated/prisma';
import type { JwtPayload } from '@/app/auth/types';

export type VisibilityOptions = {
	// When true, include hidden (isVisible=false) entities. Default: only visible
	includeHidden?: boolean;
};

export const visibleOnlyWhere = (
	options: VisibilityOptions = {},
): { isVisible: true } | Record<string, never> =>
	options.includeHidden ? {} : { isVisible: true };

export const visibilityOptionsForUser = (
	user?: Pick<JwtPayload, 'roles'> | null,
): VisibilityOptions => ({
	includeHidden: Boolean(user?.roles?.includes(Role.ADMIN)),
});
