import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

	@Public()
	@Post('signup')
	@HttpCode(HttpStatus.CREATED)
	signup(@Body() dto: AuthDto): Promise<Tokens> {
		return this.authService.signUp(dto);
	}

	@Public()
	@Post('signin')
	@HttpCode(HttpStatus.OK)
	signin(@Body() dto: AuthDto): Promise<Tokens> {
		return this.authService.signIn(dto);
	}

	@Get('logout')
	@HttpCode(HttpStatus.OK)
	logout(@GetCurrentUserId() userId: number): Promise<boolean> {
		return this.authService.logout(userId);
	}

	@Public()
	@UseGuards(RtGuard)
	@Get('refresh')
	@HttpCode(HttpStatus.OK)
	refreshTokens(
		@GetCurrentUserId() userId: number,
		@GetCurrentUser('refreshToken') refreshToken: string,
	): Promise<Tokens> {
		return this.authService.refreshTokens(userId, refreshToken);
	}
}
