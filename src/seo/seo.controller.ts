import {
	Body,
	Controller,
	Get,
	Param,
	ParseEnumPipe,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { HasRoles } from '@/app/auth/decorators/has-roles.decorator';
import { Public } from '@/app/auth/decorators/public.decorator';
import { RolesGuard } from '@/app/auth/guards/roles.guard';
import { Role, SeoEntityType } from '@/app/generated/prisma';

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

	@ApiBearerAuth()
	@ApiOkResponse({ type: [SeoTemplateDto] })
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Get('templates')
	getTemplates(): Promise<SeoTemplateDto[]> {
		return this.seoService.getTemplates();
	}

	@ApiBearerAuth()
	@ApiOkResponse({ type: SeoTemplateDto })
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
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

	@ApiBearerAuth()
	@ApiOkResponse({ type: SeoMetadataDto })
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Patch('metadata/:entityType/:entityKey')
	updateMetadata(
		@Param('entityType', new ParseEnumPipe(SeoEntityType)) entityType: SeoEntityType,
		@Param('entityKey') entityKey: string,
		@Body() dto: SeoMetadataUpdateDto,
	): Promise<SeoMetadataDto> {
		return this.seoService.updateMetadata(entityType, entityKey, dto);
	}
}
