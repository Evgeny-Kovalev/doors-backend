import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { Attribute } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductVariantFromFile } from 'src/products/types';

@Injectable()
export class AttributesService {
	constructor(private readonly prismaServise: PrismaService) {}

	async getOneById(id: number): Promise<Attribute | null> {
		return await this.prismaServise.attribute.findFirst({ where: { id } });
	}

	async getOne(name: string, value: string): Promise<Attribute | null> {
		return await this.prismaServise.attribute.findFirst({ where: { name, value } });
	}

	async getManyByName(name: string): Promise<Attribute[]> {
		return await this.prismaServise.attribute.findMany({ where: { name } });
	}

	async getManyByIds(ids: number[]): Promise<Attribute[]> {
		return await this.prismaServise.attribute.findMany({ where: { id: { in: ids } } });
	}

	async getOrCreateOne(name: string, value: string): Promise<Attribute> {
		const isAttributeExist = await this.isExist(name);

		if (isAttributeExist) {
			const attributeValues = await this.getValuesByName(name);

			if (attributeValues.includes(value)) {
				// attribute with the same value already exists, just push
				const existedAttribute = await this.getOne(name, value);
				if (!existedAttribute) throw new InternalServerErrorException();
				return existedAttribute;
			} else {
				// add value to existing attribute
				const newAttribute = await this.createOne({
					name: name,
					value: value,
				});
				return newAttribute;
			}
		} else {
			// create new attribute
			const newAttribute = await this.createOne({
				name: name,
				value: value,
			});
			return newAttribute;
		}
	}

	async getOrCreateMany(
		keys: string[],
		variantFromFile: ProductVariantFromFile,
		allVariants: ProductVariantFromFile[],
	): Promise<Attribute[]> {
		const attributes: Attribute[] = [];

		for (const attrKey of keys) {
			const valueInDoc = variantFromFile[attrKey];

			if (valueInDoc === undefined)
				throw new BadRequestException(`There is no attribute '${attrKey}' in file`);

			const isAllEmpty = allVariants.every((variant) => variant[attrKey] === '');

			if (valueInDoc === '' && isAllEmpty) continue;

			const attribute = await this.getOrCreateOne(attrKey, valueInDoc);
			attributes.push(attribute);
		}
		return attributes;
	}

	async getValuesByName(name: string): Promise<string[]> {
		const attributesWithName = await this.getManyByName(name);
		if (!attributesWithName)
			throw new BadRequestException('There is no attribute with this name');

		return attributesWithName.reduce((acc: string[], attr) => {
			acc.push(attr.value);
			return acc;
		}, []);
	}

	async createOne({ name, value }: { name: string; value: string }) {
		const newAttribute = await this.prismaServise.attribute.create({
			data: { name, value },
		});
		return newAttribute;
	}

	async isExist(name: string): Promise<boolean> {
		return !!(await this.prismaServise.attribute.findFirst({ where: { name } }));
	}

	async update() {}

	async delete() {}
}
