import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@/app/generated/prisma';
import { HasRoles } from './has-roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

export const Admin = () =>
	applyDecorators(ApiBearerAuth(), HasRoles(Role.ADMIN), UseGuards(RolesGuard));
