import { News } from '@prisma/client';
import { NewsPreviewDto } from '../dto';

export const toNewsPreviewDto = (news: News): NewsPreviewDto => {
	return {
		...news,
		publishedAt: news.publishedAt.toISOString(),
	};
};
