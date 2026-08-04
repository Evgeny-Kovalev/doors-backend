import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@/app/generated/prisma';
import { HasRoles } from './has-roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { ACCESS_TOKEN_COOKIE } from '../constants/cookies';

export const Admin = () =>
	applyDecorators(
		ApiCookieAuth(ACCESS_TOKEN_COOKIE),
		HasRoles(Role.ADMIN),
		UseGuards(RolesGuard),
		SkipThrottle(),
	);
