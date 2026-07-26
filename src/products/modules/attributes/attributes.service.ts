import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { Attribute, AttributeValue } from '@/app/generated/prisma';
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

@Injectable()
export class AttributesService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly logger = new Logger(AttributesService.name);

	async findAll(): Promise<AttributeDto[]> {
		return await this.prismaService.attribute.findMany({
			include: { key: true, value: true },
		});
	}

	async create(dto: AttributeCreateDto): Promise<AttributeDto> {
		return this.getOrCreateOne(dto);
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
			const existing = await this.getOne(dto.key.value, dto.value.value);
			if (existing) return existing;
			return await this.createOne(dto);
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

	async createOne(dto: AttributeCreateDto): Promise<AttributeDto> {
		try {
			const newAttribute: AttributeDto = await this.prismaService.attribute.create({
				data: {
					key: {
						connectOrCreate: {
							where: {
								value: dto.key.value,
							},
							create: {
								value: dto.key.value,
								label: dto.key.label,
							},
						},
					},
					value: {
						connectOrCreate: {
							where: {
								value: dto.value.value,
							},
							create: {
								value: dto.value.value,
								imgUrl: dto.value.imgUrl,
							},
						},
					},
				},
				include: { key: true, value: true },
			});
			return newAttribute;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException('Cannot create the attribute');
		}
	}

	async isExist(key: string): Promise<boolean> {
		return !!(await this.prismaService.attribute.findFirst({
			where: { key: { value: key } },
		}));
	}

	async updateKey(id: number, dto: AttributeKeyUpdateDto): Promise<AttributeKeyDto> {
		return await this.prismaService.attributeKey.update({
			where: { id },
			data: {
				value: dto.value,
				label: dto.label,
			},
		});
	}

	async updateValue(
		id: number,
		dto: AttributeValueUpdateDto,
	): Promise<AttributeValueDto> {
		return await this.prismaService.attributeValue.update({
			where: { id },
			data: {
				value: dto.value,
				imgUrl: dto.imgUrl,
			},
		});
	}

	async delete(id: number): Promise<AttributeDto> {
		try {
			return await this.prismaService.attribute.delete({
				where: { id },
				include: { key: true, value: true },
			});
		} catch {
			throw new NotFoundException('Attribute with this id not found');
		}
	}
}
