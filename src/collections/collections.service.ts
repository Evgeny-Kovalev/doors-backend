import { NotFoundException, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/app/prisma/prisma.service';
import {
	CollectionCreateDto,
	CollectionDto,
	CollectionListItemDto,
	CollectionUpdateDto,
} from './dto';
import {
	COLLECTION_ADMIN_INCLUDE,
	COLLECTION_DETAIL_INCLUDE,
	COLLECTION_LIST_INCLUDE,
	COLLECTION_LIST_INCLUDE_WITH_HIDDEN,
} from '@/app/shared/product-include';
import { VisibilityOptions } from '@/app/shared/visibility';

@Injectable()
export class CollectionsService {
	constructor(private readonly prismaService: PrismaService) {}

	async findOne(id: number, options: VisibilityOptions = {}): Promise<CollectionDto> {
		const collection = await this.prismaService.collection.findFirst({
			where: { id },
			include: options.includeHidden
				? COLLECTION_ADMIN_INCLUDE
				: COLLECTION_DETAIL_INCLUDE,
		});
		if (!collection) throw new NotFoundException('Collection with this id not found');
		return collection;
	}

	async findAll(options: VisibilityOptions = {}): Promise<CollectionListItemDto[]> {
		return this.prismaService.collection.findMany({
			include: options.includeHidden
				? COLLECTION_LIST_INCLUDE_WITH_HIDDEN
				: COLLECTION_LIST_INCLUDE,
		});
	}

	async update(id: number, dto: CollectionUpdateDto): Promise<CollectionDto> {
		const { title, categoryIds, productIds } = dto;
		try {
			return await this.prismaService.collection.update({
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
				include: COLLECTION_ADMIN_INCLUDE,
			});
		} catch (e) {
			throw new BadRequestException('Cannot update the collection');
		}
	}

	async create(dto: CollectionCreateDto): Promise<CollectionDto> {
		const { title, categoryIds, productIds } = dto;
		try {
			return await this.prismaService.collection.create({
				data: {
					title,
					categories: { connect: categoryIds.map((id) => ({ id })) },
					products: { connect: productIds.map((id) => ({ id })) },
				},
				include: COLLECTION_ADMIN_INCLUDE,
			});
		} catch (e) {
			throw new BadRequestException('Cannot create the collection');
		}
	}
}
