import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import type { Attribute, AttributeValue, Prisma } from '@/app/generated/prisma';
import { PrismaService } from '@/app/prisma/prisma.service';
import { ProductVariantFromFile } from '@/app/products/types';
import {
	AttributeCreateDto,
	AttributeDto,
	AttributeKeyDto,
	AttributeKeyUpdateDto,
	AttributeValueDto,
	AttributeValueUpdateDto,
} from './dto';
import { AuditLogService } from '@/app/audit-log/audit-log.service';
import { AuditLogWriteError } from '@/app/audit-log/audit-log.error';

type AttributePrismaClient = Pick<Prisma.TransactionClient, 'attribute'>;

@Injectable()
export class AttributesService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly auditLogService: AuditLogService,
	) {}

	private readonly logger = new Logger(AttributesService.name);

	private async findOrCreate(
		client: AttributePrismaClient,
		dto: AttributeCreateDto,
	): Promise<{ attribute: AttributeDto; created: boolean }> {
		const existing = await client.attribute.findFirst({
			where: {
				key: { value: dto.key.value },
				value: { value: dto.value.value },
			},
			include: { key: true, value: true },
		});
		if (existing) return { attribute: existing, created: false };

		const attribute = await client.attribute.create({
			data: {
				key: {
					connectOrCreate: {
						where: { value: dto.key.value },
						create: {
							value: dto.key.value,
							label: dto.key.label,
						},
					},
				},
				value: {
					connectOrCreate: {
						where: { value: dto.value.value },
						create: {
							value: dto.value.value,
							imgUrl: dto.value.imgUrl,
						},
					},
				},
			},
			include: { key: true, value: true },
		});
		return { attribute, created: true };
	}

	async findAll(): Promise<AttributeDto[]> {
		return await this.prismaService.attribute.findMany({
			include: { key: true, value: true },
		});
	}

	async create(dto: AttributeCreateDto): Promise<AttributeDto> {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				const { attribute, created } = await this.findOrCreate(tx, dto);
				if (created) {
					await this.auditLogService.record(tx, {
						action: 'attribute.created',
						entityType: 'attribute',
						entityId: attribute.id,
						entityLabel: `${attribute.key.label}: ${attribute.value.value}`,
					});
				}
				return attribute;
			});
		} catch (e) {
			this.logger.error(e);
			if (e instanceof AuditLogWriteError) {
				throw new InternalServerErrorException('Cannot persist attribute audit log');
			}
			throw new BadRequestException('Cannot get/create the attribute');
		}
	}

	async getOneById(id: number): Promise<Attribute | null> {
		return await this.prismaService.attribute.findFirst({ where: { id } });
	}

	async getOne(key: string, value: string): Promise<AttributeDto | null> {
		return await this.prismaService.attribute.findFirst({
			where: { key: { value: key }, value: { value } },
			include: { key: true, value: true },
		});
	}

	async getManyByKey(key: string): Promise<AttributeDto[]> {
		return await this.prismaService.attribute.findMany({
			where: { key: { value: key } },
			include: { key: true, value: true },
		});
	}

	async getManyByIds(ids: number[]): Promise<AttributeDto[]> {
		return await this.prismaService.attribute.findMany({
			where: { id: { in: ids } },
			include: { key: true, value: true },
		});
	}

	async getOrCreateOne(dto: AttributeCreateDto): Promise<AttributeDto> {
		try {
			const { attribute } = await this.findOrCreate(this.prismaService, dto);
			return attribute;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot get/create the attribute');
		}
	}

	async getOrCreateMany(
		keys: string[],
		variantFromFile: ProductVariantFromFile,
		allVariants: ProductVariantFromFile[],
	): Promise<AttributeDto[]> {
		const attributes: AttributeDto[] = [];

		for (const attrKey of keys) {
			const valueInDoc = variantFromFile[attrKey];

			if (valueInDoc === undefined)
				throw new BadRequestException(`There is no attribute '${attrKey}' in file`);

			const isAllEmpty = allVariants.every((variant) => variant[attrKey] === '');

			if (valueInDoc === '' && isAllEmpty) continue;

			const attribute = await this.getOrCreateOne({
				key: {
					value: attrKey,
					label: attrKey,
				},
				value: {
					value: valueInDoc,
					imgUrl: null,
				},
			});
			attributes.push(attribute);
		}
		return attributes;
	}

	async getValuesByKey(key: string): Promise<AttributeValue[]> {
		const attributes = await this.getManyByKey(key);
		if (!attributes)
			throw new BadRequestException('There is no attribute with this key');

		return attributes.reduce((acc: AttributeValue[], attr) => {
			acc.push(attr.value);
			return acc;
		}, []);
	}

	async isExist(key: string): Promise<boolean> {
		return !!(await this.prismaService.attribute.findFirst({
			where: { key: { value: key } },
		}));
	}

	async updateKey(id: number, dto: AttributeKeyUpdateDto): Promise<AttributeKeyDto> {
		return await this.prismaService.$transaction(async (tx) => {
			const key = await tx.attributeKey.update({
				where: { id },
				data: {
					value: dto.value,
					label: dto.label,
				},
			});
			await this.auditLogService.record(tx, {
				action: 'attribute_key.updated',
				entityType: 'attribute_key',
				entityId: key.id,
				entityLabel: key.label || key.value,
			});
			return key;
		});
	}

	async updateValue(
		id: number,
		dto: AttributeValueUpdateDto,
	): Promise<AttributeValueDto> {
		return await this.prismaService.$transaction(async (tx) => {
			const value = await tx.attributeValue.update({
				where: { id },
				data: {
					value: dto.value,
					imgUrl: dto.imgUrl,
				},
			});
			await this.auditLogService.record(tx, {
				action: 'attribute_value.updated',
				entityType: 'attribute_value',
				entityId: value.id,
				entityLabel: value.value,
			});
			return value;
		});
	}

	async delete(id: number): Promise<AttributeDto> {
		try {
			return await this.prismaService.$transaction(async (tx) => {
				const attribute = await tx.attribute.delete({
					where: { id },
					include: { key: true, value: true },
				});
				await this.auditLogService.record(tx, {
					action: 'attribute.deleted',
					entityType: 'attribute',
					entityId: attribute.id,
					entityLabel: `${attribute.key.label}: ${attribute.value.value}`,
				});
				return attribute;
			});
		} catch (e) {
			if (e instanceof AuditLogWriteError) {
				throw new InternalServerErrorException('Cannot persist attribute audit log');
			}
			throw new NotFoundException('Attribute with this id not found');
		}
	}
}
