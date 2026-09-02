import { User } from '@/app/generated/prisma';
import { PrismaService } from './../prisma/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserCreateDto } from './dto';
import { AuditLogService } from '@/app/audit-log/audit-log.service';
import { AuditLogWriteError } from '@/app/audit-log/audit-log.error';

@Injectable()
export class UsersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly auditLogService: AuditLogService,
	) {}

	private readonly logger = new Logger(UsersService.name);

	async findOneByEmail(email: string): Promise<User | null> {
		return this.prismaService.user.findFirst({ where: { email } });
	}
	async findById(id: number): Promise<User | null> {
		return this.prismaService.user.findUnique({ where: { id } });
	}

	async createOne({ email, password }: UserCreateDto): Promise<User> {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				const user = await tx.user.create({
					data: {
						email,
						password,
					},
				});
				await this.auditLogService.record(tx, {
					action: 'user.created',
					entityType: 'user',
					entityId: user.id,
					entityLabel: user.email,
				});
				return user;
			});
		} catch (e) {
			this.logger.error(e);
			if (e instanceof AuditLogWriteError) throw e;
			throw new BadRequestException('Cannot create the user');
		}
	}

	async updateOne(
		id: number,
		dto: { refreshToken?: string | null; password?: string },
	): Promise<User> {
		try {
			return await this.prismaService.user.update({
				where: { id },
				data: {
					refreshToken: dto.refreshToken,
					password: dto.password,
				},
			});
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot update the user');
		}
	}
}
