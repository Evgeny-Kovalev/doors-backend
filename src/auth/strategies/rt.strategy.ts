import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { EnvService } from '@/app/env/env.service';
import { JwtPayload, JwtPayloadWithRt } from '../types';
import {
	readRefreshTokenFromRequest,
	refreshTokenExtractor,
} from '../utils/jwt-extractors';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(envService: EnvService) {
		super({
			jwtFromRequest: refreshTokenExtractor,
			secretOrKey: envService.get('RT_SECRET'),
			passReqToCallback: true,
		});
	}

	validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
		const refreshToken = readRefreshTokenFromRequest(req);

		if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

		return {
			...payload,
			refreshToken,
		};
	}
}
