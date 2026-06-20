import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/app/prisma/prisma.service';
import { CollectionCreateDto, CollectionDto, CollectionUpdateDto } from './dto';

const DEFAULT_INCLUDE = {
	categories: true,
	products: {
		include: {
			category: true,
			params: { include: { key: true, value: true } },
			variants: {
				include: {
					attributes: {
						include: {
							key: true,
							value: true,
						},
					},
					tags: true,
				},
			},
		},
	},
};

@Injectable()
export class CollectionsService {
	constructor(private readonly prismaService: PrismaService) {}

	async findOne(id: number): Promise<CollectionDto> {
		const collection: CollectionDto | null =
			await this.prismaService.collection.findFirst({
				where: { id },
				include: DEFAULT_INCLUDE,
			});
		if (!collection) throw new BadRequestException('Collection with this id not found');
		return collection;
	}

	async findAll(): Promise<CollectionDto[]> {
		const collections: CollectionDto[] = await this.prismaService.collection.findMany({
			include: DEFAULT_INCLUDE,
		});
		return collections;
	}

	async update(id: number, dto: CollectionUpdateDto): Promise<CollectionDto> {
		const { title, categoryIds, productIds } = dto;
		try {
			const updatedCollection = await this.prismaService.collection.update({
				where: { id },
				data: {
					title,
					categories: categoryIds
						? { set: categoryIds.map((id) => ({ id })) }
						: undefined,
					products: productIds
						? { set: productIds.map((id) => ({ id })) }
						: undefined,
				},
				include: DEFAULT_INCLUDE,
			});

			return updatedCollection;
		} catch (e) {
			throw new BadRequestException('Cannot update the collection');
		}
	}

	async create(dto: CollectionCreateDto) {
		const { title, categoryIds, productIds } = dto;
		try {
			const createdCollection = await this.prismaService.collection.create({
				data: {
					title,
					categories: { connect: categoryIds.map((id) => ({ id })) },
					products: { connect: productIds.map((id) => ({ id })) },
				},
				include: DEFAULT_INCLUDE,
			});
			return createdCollection;
		} catch (e) {
			throw new BadRequestException('Cannot create the collection');
		}
	}
}
