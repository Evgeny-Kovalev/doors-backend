import { User } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserCreateDto, UserUpdateDto } from './dto';

@Injectable()
export class UsersService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly logger = new Logger(UsersService.name);

	async findOneByEmail(email: string): Promise<User | null> {
		return this.prismaService.user.findFirst({ where: { email } });
	}
	async findById(id: number): Promise<User | null> {
		return this.prismaService.user.findUnique({ where: { id } });
	}

	async createOne({ email, password }: UserCreateDto): Promise<User> {
		try {
			return this.prismaService.user.create({
				data: {
					email,
					password,
				},
			});
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot create the user');
		}
	}

	async updateOne(dto: UserUpdateDto) {
		try {
			return await this.prismaService.user.update({
				where: { id: dto.id },
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
