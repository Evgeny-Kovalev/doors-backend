import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/app/generated/prisma';
import { PrismaService } from '@/app/prisma/prisma.service';
import {
	ImportTemplateConfigSchema,
	type ImportTemplateConfig,
	type ImportTemplateCreateType,
	type ImportTemplate,
	type ImportTemplateUpdateType,
} from '@/contracts';
import { AuditLogService } from '@/app/audit-log/audit-log.service';
import { AuditLogWriteError } from '@/app/audit-log/audit-log.error';

@Injectable()
export class ImportTemplatesService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly auditLogService: AuditLogService,
	) {}

	private readonly logger = new Logger(ImportTemplatesService.name);

	async findAll(): Promise<ImportTemplate[]> {
		const rows = await this.prismaService.importTemplate.findMany({
			orderBy: { id: 'asc' },
		});
		return rows.map((row) => this.toDto(row));
	}

	async findById(id: number): Promise<ImportTemplate> {
		const row = await this.prismaService.importTemplate.findUnique({
			where: { id },
		});
		if (!row) throw new NotFoundException('Import template with this id not found');
		return this.toDto(row);
	}

	async getConfigByTemplateId(templateId: number): Promise<ImportTemplateConfig> {
		const template = await this.findById(templateId);
		const { info, paramsKeysInDoc, attributesKeysInDoc } = template;
		return { info, paramsKeysInDoc, attributesKeysInDoc };
	}

	async create(dto: ImportTemplateCreateType): Promise<ImportTemplate> {
		try {
			const row = await this.prismaService.$transaction(async (tx) => {
				const template = await tx.importTemplate.create({
					data: {
						slug: dto.slug,
						name: dto.name,
						info: dto.info,
						paramsKeysInDoc: dto.paramsKeysInDoc,
						attributesKeysInDoc: dto.attributesKeysInDoc,
					},
				});
				await this.auditLogService.record(tx, {
					action: 'import_template.created',
					entityType: 'import_template',
					entityId: template.id,
					entityLabel: template.slug || template.name,
				});
				return template;
			});
			return this.toDto(row);
		} catch (e) {
			this.logger.error(e);
			if (e instanceof AuditLogWriteError) throw e;
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				throw new BadRequestException(
					'Import template with this slug already exists',
				);
			}
			throw new BadRequestException('Cannot create the import template');
		}
	}

	async update(id: number, dto: ImportTemplateUpdateType): Promise<ImportTemplate> {
		await this.findById(id);
		try {
			const row = await this.prismaService.$transaction(async (tx) => {
				const template = await tx.importTemplate.update({
					where: { id },
					data: {
						slug: dto.slug,
						name: dto.name,
						info: dto.info,
						paramsKeysInDoc: dto.paramsKeysInDoc,
						attributesKeysInDoc: dto.attributesKeysInDoc,
					},
				});
				await this.auditLogService.record(tx, {
					action: 'import_template.updated',
					entityType: 'import_template',
					entityId: template.id,
					entityLabel: template.slug || template.name,
				});
				return template;
			});
			return this.toDto(row);
		} catch (e) {
			this.logger.error(e);
			if (e instanceof AuditLogWriteError) throw e;
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				throw new BadRequestException(
					'Import template with this slug already exists',
				);
			}
			throw new BadRequestException('Cannot update the import template');
		}
	}

	async delete(id: number): Promise<ImportTemplate> {
		try {
			const row = await this.prismaService.$transaction(async (tx) => {
				const template = await tx.importTemplate.delete({ where: { id } });
				await this.auditLogService.record(tx, {
					action: 'import_template.deleted',
					entityType: 'import_template',
					entityId: template.id,
					entityLabel: template.slug || template.name,
				});
				return template;
			});
			return this.toDto(row);
		} catch (e) {
			if (e instanceof AuditLogWriteError) throw e;
			throw new NotFoundException('Import template with this id not found');
		}
	}

	private toDto(row: {
		id: number;
		slug: string;
		name: string;
		info: Prisma.JsonValue;
		paramsKeysInDoc: string[];
		attributesKeysInDoc: string[];
	}): ImportTemplate {
		const config = ImportTemplateConfigSchema.parse({
			info: row.info,
			paramsKeysInDoc: row.paramsKeysInDoc,
			attributesKeysInDoc: row.attributesKeysInDoc,
		});

		return {
			id: row.id,
			slug: row.slug,
			name: row.name,
			...config,
		};
	}
}
