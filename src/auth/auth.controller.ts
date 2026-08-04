import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from './decorators/public.decorator';
import { GetCurrentUserId } from './decorators/get-current-user-id.decorator';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { RtGuard } from './guards/rt.guard';
import { Admin } from './decorators/admin.decorator';
import { AuthCookiesService } from './utils/auth-cookies';
import { JwtPayload } from './types';
import {
	API_DEFAULT_VERSION,
	AUTH_CONTROLLER_PATH,
	AUTH_LOGOUT_ROUTE,
	AUTH_REFRESH_ROUTE,
} from '@/app/shared/api';

@ApiTags('Auth')
@Controller({
	path: AUTH_CONTROLLER_PATH,
	version: API_DEFAULT_VERSION,
})
export class AuthController {
	constructor(
		private authService: AuthService,
		private authCookiesService: AuthCookiesService,
	) {}

	private readonly logger = new Logger(AuthController.name);

	@Admin()
	@Post('signup')
	@HttpCode(HttpStatus.CREATED)
	async signup(
		@Body() dto: AuthDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		this.logger.log('User signup');
		const tokens = await this.authService.signUp(dto);
		this.authCookiesService.setAuthCookies(res, tokens);
	}

	@Public()
	@Post('signin')
	@HttpCode(HttpStatus.OK)
	async signin(
		@Body() dto: AuthDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		this.logger.log('User signin');
		const tokens = await this.authService.signIn(dto);
		this.authCookiesService.setAuthCookies(res, tokens);
	}

	@Get('me')
	@HttpCode(HttpStatus.OK)
	me(@GetCurrentUser() user: JwtPayload): JwtPayload {
		return user;
	}

	@Public()
	@UseGuards(RtGuard)
	@Post(AUTH_LOGOUT_ROUTE)
	@HttpCode(HttpStatus.OK)
	async logout(
		@GetCurrentUserId() userId: number,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		await this.authService.logout(userId);
		this.authCookiesService.clearAuthCookies(res);
	}

	@Public()
	@UseGuards(RtGuard)
	@Post(AUTH_REFRESH_ROUTE)
	@HttpCode(HttpStatus.OK)
	async refreshTokens(
		@GetCurrentUserId() userId: number,
		@GetCurrentUser('refreshToken') refreshToken: string,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		this.logger.log('User refreshTokens');
		const tokens = await this.authService.refreshTokens(userId, refreshToken);
		this.authCookiesService.setAuthCookies(res, tokens);
	}
}
