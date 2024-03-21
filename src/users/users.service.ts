import { User } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserCreateDto, UserUpdateDto } from './dto';

@Injectable()
export class UsersService {
	constructor(private readonly prismaService: PrismaService) {}

	async findOneByEmail(email: string): Promise<User | null> {
		return this.prismaService.user.findFirst({ where: { email } });
	}
	async findById(id: number): Promise<User | null> {
		return this.prismaService.user.findUnique({ where: { id } });
	}

	async createOne({ email, password }: UserCreateDto): Promise<User> {
		return this.prismaService.user.create({
			data: {
				email,
				password,
			},
		});
	}

	async updateOne(dto: UserUpdateDto) {
		return await this.prismaService.user.update({
			where: { id: dto.id },
			data: {
				refreshToken: dto.refreshToken,
				password: dto.password,
			},
		});
	}
}
