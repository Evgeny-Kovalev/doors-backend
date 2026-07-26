import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/app/prisma/prisma.service';
import { NewsPreviewDto } from './dto';
import { toNewsPreviewDto } from './utils';

@Injectable()
export class NewsService {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll(): Promise<NewsPreviewDto[]> {
		const rows = await this.prismaService.news.findMany({
			orderBy: { publishedAt: 'desc' },
		});
		return rows.map(toNewsPreviewDto);
	}

	async findOneBySlug(slug: string): Promise<NewsPreviewDto> {
		const row = await this.prismaService.news.findUnique({ where: { slug } });
		if (!row) throw new NotFoundException('News with this slug not found');
		return toNewsPreviewDto(row);
	}
}
