export type VisibilityOptions = {
	// When true, include hidden (isVisible=false) entities. Default: only visible
	includeHidden?: boolean;
};

export const visibleOnlyWhere = (
	options: VisibilityOptions = {},
): { isVisible: true } | Record<string, never> =>
	options.includeHidden ? {} : { isVisible: true };
