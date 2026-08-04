import { Request } from 'express';
import { ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants/cookies';

const fromCookie =
	(cookieName: string): JwtFromRequestFunction =>
	(req: Request): string | null => {
		const token = req?.cookies?.[cookieName];
		return typeof token === 'string' && token.length > 0 ? token : null;
	};

export const accessTokenExtractor: JwtFromRequestFunction = ExtractJwt.fromExtractors([
	fromCookie(ACCESS_TOKEN_COOKIE),
	// ExtractJwt.fromAuthHeaderAsBearerToken(),
]);

export const refreshTokenExtractor: JwtFromRequestFunction = ExtractJwt.fromExtractors([
	fromCookie(REFRESH_TOKEN_COOKIE),
	// ExtractJwt.fromAuthHeaderAsBearerToken(),
]);

export const readRefreshTokenFromRequest = (req: Request): string | undefined => {
	const fromCookieValue = req?.cookies?.[REFRESH_TOKEN_COOKIE];
	if (typeof fromCookieValue === 'string' && fromCookieValue.length > 0) {
		return fromCookieValue;
	}

	// const header = req?.get('authorization');
	// if (!header) return undefined;

	// return header.replace(/^Bearer\s+/i, '').trim() || undefined;
	return undefined;
};
