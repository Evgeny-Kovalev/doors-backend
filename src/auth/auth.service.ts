import { EnvService } from './../env/env.service';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { JwtPayload, Tokens } from './types';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly envService: EnvService,
	) {}

	async signUp(dto: AuthDto): Promise<Tokens> {
		const userExists = await this.usersService.findOneByEmail(dto.email);
		if (userExists) throw new BadRequestException('User already exists');

		const hash = await argon.hash(dto.password);

		const user = await this.usersService.createOne({
			email: dto.email,
			password: hash,
		});

		const tokens = await this.generateTokens(user, user.email);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async signIn(dto: AuthDto): Promise<Tokens> {
		const user = await this.usersService.findOneByEmail(dto.email);
		if (!user) throw new ForbiddenException('User does not exist');

		const passwordMatches = await argon.verify(user.password, dto.password);
		if (!passwordMatches) throw new ForbiddenException('Password is incorrect');

		const tokens = await this.generateTokens(user, user.email);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async logout(userId: number): Promise<boolean> {
		await this.usersService.updateOne({ id: userId, refreshToken: null });
		return true;
	}

	async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
		const user = await this.usersService.findById(userId);
		if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

		const refreshTokenMatches = await argon.verify(user.refreshToken, refreshToken);
		if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

		const tokens = await this.generateTokens(user, user.email);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	private async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
		const hashedRefreshToken = await argon.hash(refreshToken);
		await this.usersService.updateOne({ id: userId, refreshToken: hashedRefreshToken });
	}

	private async generateTokens(user: User, email: string): Promise<Tokens> {
		const jwtPayload: JwtPayload = {
			sub: user.id,
			email,
			roles: user.roles,
		};

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(jwtPayload, {
				secret: this.envService.get('AT_SECRET'),
				expiresIn: '15m',
			}),
			this.jwtService.signAsync(jwtPayload, {
				secret: this.envService.get('RT_SECRET'),
				expiresIn: '7d',
			}),
		]);

		return {
			accessToken,
			refreshToken,
		};
	}
}
