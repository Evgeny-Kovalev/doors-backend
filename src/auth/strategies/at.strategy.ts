import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';
import { EnvService } from '@/app/env/env.service';
import { accessTokenExtractor } from '../utils/jwt-extractors';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(envService: EnvService) {
		super({
			jwtFromRequest: accessTokenExtractor,
			secretOrKey: envService.get('AT_SECRET'),
		});
	}

	validate(payload: JwtPayload) {
		return payload;
	}
}
