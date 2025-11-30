import { Public } from '../auth/decorators/public.decorator';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { Controller, Get } from '@nestjs/common';

import { TagDto } from './dto';

@ApiTags('Tags')
@Controller({
	path: 'tags',
	version: '1',
})
export class TagsController {
	constructor(private readonly tagsService: TagsService) {}

	@Public()
	@ApiOkResponse({ type: [TagsService] })
	@Get('/')
	async getAll(): Promise<TagDto[]> {
		const tags = await this.tagsService.findAll();
		return tags;
	}
}
