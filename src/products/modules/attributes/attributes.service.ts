import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { Attribute, AttributeValue } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductVariantFromFile } from 'src/products/types';
import { AttributeCreateDto, AttributeDto } from './dto/attribute.dto';

@Injectable()
export class AttributesService {
	constructor(private readonly prismaServise: PrismaService) {}

	private readonly logger = new Logger(AttributesService.name);

	async getOneById(id: number): Promise<Attribute | null> {
		return await this.prismaServise.attribute.findFirst({ where: { id } });
	}

	async getOne(key: string, value: string): Promise<AttributeDto | null> {
		return await this.prismaServise.attribute.findFirst({
			where: { key: { value: key }, value: { value } },
			include: { key: true, value: true },
		});
	}

	async getManyByKey(key: string): Promise<AttributeDto[]> {
		return await this.prismaServise.attribute.findMany({
			where: { key: { value: key } },
			include: { key: true, value: true },
		});
	}

	async getManyByIds(ids: number[]): Promise<AttributeDto[]> {
		return await this.prismaServise.attribute.findMany({
			where: { id: { in: ids } },
			include: { key: true, value: true },
		});
	}

	async getOrCreateOne(dto: AttributeCreateDto): Promise<AttributeDto> {
		try {
			const key = dto.key.value;
			const value = dto.value.value;

			const isAttributeExist = await this.isExist(key);

			if (isAttributeExist) {
				const attributeValues = await this.getValuesByKey(key);

				if (attributeValues.find((attr) => attr.value === value)) {
					// attribute with the same value already exists, just push
					const existedAttribute = await this.getOne(key, value);
					if (!existedAttribute) throw new InternalServerErrorException();
					return existedAttribute;
				} else {
					// add value to existing attribute
					const newAttribute = await this.createOne({
						key: { ...dto.key },
						value: { ...dto.value },
					});
					return newAttribute;
				}
			} else {
				// create new attribute
				const newAttribute = await this.createOne({
					key: { ...dto.key },
					value: { ...dto.value },
				});
				return newAttribute;
			}
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
					imgUrl: null,
				},
				value: {
					value: valueInDoc,
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
			const newAttribute: AttributeDto = await this.prismaServise.attribute.create({
				data: {
					key: {
						connectOrCreate: {
							where: {
								value: dto.key.value,
							},
							create: {
								value: dto.key.value,
								label: dto.key.label,
								imgUrl: dto.key.imgUrl,
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
		return !!(await this.prismaServise.attribute.findFirst({
			where: { key: { value: key } },
		}));
	}

	async update() {}

	async delete() {}
}
