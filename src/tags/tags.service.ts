import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { Tag } from '@/app/generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import type { TagCreateDtoType, TagUpdateDtoType } from '@/contracts';
import { AuditLogService } from '@/app/audit-log/audit-log.service';
import { AuditLogWriteError } from '@/app/audit-log/audit-log.error';

@Injectable()
export class TagsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly auditLogService: AuditLogService,
	) {}

	private readonly logger = new Logger(TagsService.name);

	async findAll(): Promise<Tag[]> {
		return this.prismaService.tag.findMany({ orderBy: { id: 'asc' } });
	}

	async findManyByKeys(keys: string[]): Promise<Tag[]> {
		const uniqueKeys = [...new Set(keys.map((key) => key.trim()).filter(Boolean))];
		if (!uniqueKeys.length) return [];

		const tags = await this.prismaService.tag.findMany({
			where: { key: { in: uniqueKeys } },
		});

		const foundKeys = new Set(tags.map((tag) => tag.key));
		const missingKeys = uniqueKeys.filter((key) => !foundKeys.has(key));
		if (missingKeys.length) {
			throw new BadRequestException(`Unknown tag keys: ${missingKeys.join(', ')}`);
		}

		return tags;
	}

	async create(dto: TagCreateDtoType): Promise<Tag> {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				const tag = await tx.tag.create({
					data: {
						key: dto.key,
						label: dto.label,
					},
				});
				await this.auditLogService.record(tx, {
					action: 'tag.created',
					entityType: 'tag',
					entityId: tag.id,
					entityLabel: tag.key || tag.label,
				});
				return tag;
			});
		} catch (e) {
			this.logger.error(e);
			if (e instanceof AuditLogWriteError) throw e;
			throw new BadRequestException('Cannot create the tag');
		}
	}

	async update(id: number, dto: TagUpdateDtoType): Promise<Tag> {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				const tag = await tx.tag.update({
					where: { id },
					data: {
						key: dto.key,
						label: dto.label,
					},
				});
				await this.auditLogService.record(tx, {
					action: 'tag.updated',
					entityType: 'tag',
					entityId: tag.id,
					entityLabel: tag.key || tag.label,
				});
				return tag;
			});
		} catch (e) {
			if (e instanceof AuditLogWriteError) throw e;
			throw new NotFoundException('Tag with this id not found');
		}
	}

	async delete(id: number): Promise<Tag> {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				const tag = await tx.tag.delete({ where: { id } });
				await this.auditLogService.record(tx, {
					action: 'tag.deleted',
					entityType: 'tag',
					entityId: tag.id,
					entityLabel: tag.key || tag.label,
				});
				return tag;
			});
		} catch (e) {
			if (e instanceof AuditLogWriteError) throw e;
			throw new NotFoundException('Tag with this id not found');
		}
	}
}
