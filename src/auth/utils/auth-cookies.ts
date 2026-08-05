import { Injectable } from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { EnvService } from '@/app/env/env.service';
import { Tokens } from '../types';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants/cookies';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../constants/tokens';

@Injectable()
export class AuthCookiesService {
	constructor(private readonly envService: EnvService) {}

	setAuthCookies(res: Response, tokens: Tokens): void {
		res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, this.accessCookieOptions());
		res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, this.refreshCookieOptions());
	}

	clearAuthCookies(res: Response): void {
		res.clearCookie(ACCESS_TOKEN_COOKIE, this.accessCookieBase());
		res.clearCookie(REFRESH_TOKEN_COOKIE, this.refreshCookieBase());
	}

	private baseCookieOptions(): CookieOptions {
		const domain = this.envService.get('COOKIE_DOMAIN');
		const isProd = this.envService.get('NODE_ENV') === 'production';

		return {
			httpOnly: true,
			secure: isProd,
			sameSite: 'lax',
			...(domain ? { domain } : {}),
		};
	}

	private accessCookieBase(): CookieOptions {
		return {
			...this.baseCookieOptions(),
			path: '/',
		};
	}

	private refreshCookieBase(): CookieOptions {
		return {
			...this.baseCookieOptions(),
			path: '/',
		};
	}

	private accessCookieOptions(): CookieOptions {
		return {
			...this.accessCookieBase(),
			maxAge: ACCESS_TOKEN_TTL.ms,
		};
	}

	private refreshCookieOptions(): CookieOptions {
		return {
			...this.refreshCookieBase(),
			maxAge: REFRESH_TOKEN_TTL.ms,
		};
	}
}
