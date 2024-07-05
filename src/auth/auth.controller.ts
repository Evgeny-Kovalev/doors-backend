import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from './decorators/public.decorator';
import { Tokens } from './types';
import { GetCurrentUserId } from './decorators/get-current-user-id.decorator';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { RtGuard } from './guards/rt.guard';

@ApiTags('Auth')
@Controller({
	path: 'auth',
	version: '1',
})
export class AuthController {
	constructor(private authService: AuthService) {}

	private readonly logger = new Logger(AuthController.name);

	@Public()
	@Post('signup')
	@HttpCode(HttpStatus.CREATED)
	signup(@Body() dto: AuthDto): Promise<Tokens> {
		this.logger.log('User signup');
		return this.authService.signUp(dto);
	}

	@Public()
	@Post('signin')
	@HttpCode(HttpStatus.OK)
	signin(@Body() dto: AuthDto): Promise<Tokens> {
		this.logger.log('User signin');
		return this.authService.signIn(dto);
	}

	@ApiBearerAuth()
	@Get('logout')
	@HttpCode(HttpStatus.OK)
	logout(@GetCurrentUserId() userId: number): Promise<boolean> {
		return this.authService.logout(userId);
	}

	@ApiBearerAuth()
	@UseGuards(RtGuard)
	@Get('refresh')
	@HttpCode(HttpStatus.OK)
	refreshTokens(
		@GetCurrentUserId() userId: number,
		@GetCurrentUser('refreshToken') refreshToken: string,
	): Promise<Tokens> {
		this.logger.log('User refreshTokens');
		return this.authService.refreshTokens(userId, refreshToken);
	}
}
