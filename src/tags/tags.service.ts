import { Tag } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TagsService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly logger = new Logger(TagsService.name);

	async findAll(): Promise<Tag[]> {
		return this.prismaService.tag.findMany();
	}
}
