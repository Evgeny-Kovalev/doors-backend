import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(envService: EnvService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: envService.get('AT_SECRET'),
		});
	}

	validate(payload: JwtPayload) {
		return payload;
	}
}
