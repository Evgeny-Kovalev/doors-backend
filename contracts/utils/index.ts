export const parseJsonField = (value: unknown) => {
	if (typeof value !== 'string') return value;

	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
};
