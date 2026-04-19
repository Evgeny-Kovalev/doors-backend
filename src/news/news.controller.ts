import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';

import { NewsService } from './news.service';
import { NewsPreviewDto } from './dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('News')
@Controller({
	path: 'news',
	version: '1',
})
export class NewsController {
	constructor(private readonly newsService: NewsService) {}

	@Public()
	@Get()
	@ApiOkResponse({ type: [NewsPreviewDto] })
	async findAll(): Promise<NewsPreviewDto[]> {
		return this.newsService.findAll();
	}

	@Public()
	@Get(':slug')
	@ApiOkResponse({ type: NewsPreviewDto })
	async findOne(@Param('slug') slug: string): Promise<NewsPreviewDto> {
		return this.newsService.findOneBySlug(slug);
	}
}
