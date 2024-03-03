import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute } from '../models/Attribute.entity';

@Injectable()
export class AttributesService {
	constructor(
		@InjectRepository(Attribute)
		private readonly attributeRepository: Repository<Attribute>,
	) {}

	async getOneById(id: number) {
		return await this.attributeRepository.find({ where: { id } });
	}

	async getByName(name: string) {
		return await this.attributeRepository.find({ where: { name } });
	}

	async getOne(name: string, value: string) {
		return await this.attributeRepository.findOneBy({ name, value });
	}

	async getOrCreate(name: string, value: string): Promise<Attribute> {
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

	async getValuesByName(name: string): Promise<string[]> {
		const attributesWithName = await this.getByName(name);
		return attributesWithName.reduce((acc: string[], attr) => {
			acc.push(attr.value);
			return acc;
		}, []);
	}

	async createOne({ name, value }: { name: string; value: string }) {
		const newAttribute = await this.attributeRepository.create({ name, value });
		return await this.attributeRepository.save(newAttribute);
	}

	async isExist(name: string) {
		return await this.attributeRepository.existsBy({ name });
	}

	async update() {}

	async delete() {}
}
