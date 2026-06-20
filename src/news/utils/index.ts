import { News } from '@/app/generated/prisma';
import { NewsPreviewDto } from '../dto';

export const toNewsPreviewDto = (news: News): NewsPreviewDto => {
	return {
		...news,
		publishedAt: news.publishedAt.toISOString(),
	};
};
