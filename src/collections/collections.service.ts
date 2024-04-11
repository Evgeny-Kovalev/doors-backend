import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CollectionCreateDto, CollectionDto } from './dto';

@Injectable()
export class CollectionsService {
	constructor(private readonly prismaService: PrismaService) {}

	async findOne(id: number): Promise<CollectionDto> {
		const collection: CollectionDto | null =
			await this.prismaService.collection.findFirst({
				where: { id },
				include: {
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
								},
							},
						},
					},
				},
			});
		if (!collection) throw new BadRequestException('Collection with this id not found');
		return collection;
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
				include: {
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
								},
							},
						},
					},
				},
			});
			return createdCollection;
		} catch (e) {
			throw new BadRequestException('Cannot create the collection');
		}
	}
}
