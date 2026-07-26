import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { Tag } from '@/app/generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import type { TagCreateDtoType, TagUpdateDtoType } from '@/contracts';

@Injectable()
export class TagsService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly logger = new Logger(TagsService.name);

	async findAll(): Promise<Tag[]> {
		return this.prismaService.tag.findMany({ orderBy: { id: 'asc' } });
	}

	async create(dto: TagCreateDtoType): Promise<Tag> {
		try {
			return await this.prismaService.tag.create({
				data: {
					key: dto.key,
					label: dto.label,
				},
			});
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot create the tag');
		}
	}

	async update(id: number, dto: TagUpdateDtoType): Promise<Tag> {
		try {
			return await this.prismaService.tag.update({
				where: { id },
				data: {
					key: dto.key,
					label: dto.label,
				},
			});
		} catch {
			throw new NotFoundException('Tag with this id not found');
		}
	}

	async delete(id: number): Promise<Tag> {
		try {
			return await this.prismaService.tag.delete({ where: { id } });
		} catch {
			throw new NotFoundException('Tag with this id not found');
		}
	}
}
