import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { EnvService } from 'src/env/env.service';
import { JwtPayload, JwtPayloadWithRt } from '../types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(envService: EnvService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: envService.get('RT_SECRET'),
			passReqToCallback: true,
		});
	}

	validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
		const refreshToken = req?.get('authorization')?.replace('Bearer', '').trim();

		if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

		return {
			...payload,
			refreshToken,
		};
	}
}
