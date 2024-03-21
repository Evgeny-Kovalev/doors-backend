import { EnvService } from './../env/env.service';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AtGuard } from './guards/at.guard';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
	providers: [
		AuthService,
		AtStrategy,
		RtStrategy,
		{
			provide: APP_GUARD,
			useClass: AtGuard,
		},
	],
	controllers: [AuthController],
	imports: [
		UsersModule,
		PrismaModule,
		PassportModule,
		JwtModule.registerAsync({
			inject: [EnvService],
			useFactory: (envService: EnvService) => ({
				secret: envService.get('SECRET_JWT'),
				signOptions: { expiresIn: envService.get('TOKEN_EXPIRES_IN') },
			}),
		}),
	],
})
export class AuthModule {}
