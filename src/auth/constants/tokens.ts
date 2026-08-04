export const ACCESS_TOKEN_TTL = {
	jwt: '15m',
	ms: 15 * 60 * 1000, // 15 minutes
} as const;

export const REFRESH_TOKEN_TTL = {
	jwt: '7d',
	ms: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;
