import { Body, Controller, Get, Param, ParseEnumPipe, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Admin } from '@/app/auth/decorators/admin.decorator';
import { Public } from '@/app/auth/decorators/public.decorator';
import { SeoEntityType } from '@/app/generated/prisma';

import {
	SeoMetadataDto,
	SeoMetadataUpdateDto,
	SeoTemplateDto,
	SeoTemplateUpdateDto,
} from './dto';
import { SeoService } from './seo.service';

@ApiTags('SEO')
@Controller({
	path: 'seo',
	version: '1',
})
export class SeoController {
	constructor(private readonly seoService: SeoService) {}

	@Admin()
	@ApiOkResponse({ type: [SeoTemplateDto] })
	@Get('templates')
	getTemplates(): Promise<SeoTemplateDto[]> {
		return this.seoService.getTemplates();
	}

	@Admin()
	@ApiOkResponse({ type: SeoTemplateDto })
	@Patch('templates/:entityType')
	updateTemplate(
		@Param('entityType', new ParseEnumPipe(SeoEntityType))
		entityType: SeoEntityType,
		@Body() dto: SeoTemplateUpdateDto,
	): Promise<SeoTemplateDto> {
		return this.seoService.updateTemplate(entityType, dto);
	}

	@Public()
	@ApiOkResponse({ type: SeoMetadataDto })
	@Get('metadata/:entityType/:entityKey')
	getMetadata(
		@Param('entityType', new ParseEnumPipe(SeoEntityType))
		entityType: SeoEntityType,
		@Param('entityKey') entityKey: string,
	): Promise<SeoMetadataDto> {
		return this.seoService.getMetadata(entityType, entityKey);
	}

	@Admin()
	@ApiOkResponse({ type: SeoMetadataDto })
	@Patch('metadata/:entityType/:entityKey')
	updateMetadata(
		@Param('entityType', new ParseEnumPipe(SeoEntityType)) entityType: SeoEntityType,
		@Param('entityKey') entityKey: string,
		@Body() dto: SeoMetadataUpdateDto,
	): Promise<SeoMetadataDto> {
		return this.seoService.updateMetadata(entityType, entityKey, dto);
	}
}
