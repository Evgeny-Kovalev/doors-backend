import { BadRequestException, Injectable } from '@nestjs/common';

import {
	SEO_TEMPLATE_VARIABLES,
	type SeoTemplateVariables,
	type SeoTemplateVariable,
} from '@/contracts';
import { SeoEntityType } from '@/app/generated/prisma';
import { PrismaService } from '@/app/prisma/prisma.service';

import {
	SeoMetadataDto,
	SeoMetadataUpdateDto,
	ResolvedSeoMetadataDto,
	SeoTemplateDto,
	SeoTemplateUpdateDto,
} from './dto';
import { SEO_RESOLVER_REGISTRY } from './strategies/registry';

@Injectable()
export class SeoService {
	constructor(private readonly prismaService: PrismaService) {}

	async getTemplates(): Promise<SeoTemplateDto[]> {
		const templates = await Promise.all(
			Object.values(SeoEntityType).map((entityType) => this.getTemplate(entityType)),
		);

		return templates.map(({ entityType, titleTemplate, descriptionTemplate }) => ({
			entityType,
			titleTemplate,
			descriptionTemplate,
			availableVariables: [...SEO_TEMPLATE_VARIABLES[entityType]],
		}));
	}

	async updateTemplate(
		entityType: SeoEntityType,
		dto: SeoTemplateUpdateDto,
	): Promise<SeoTemplateDto> {
		this.validateTemplate(entityType, dto.titleTemplate);
		this.validateTemplate(entityType, dto.descriptionTemplate);

		const template = await this.prismaService.seoTemplate.update({
			where: { entityType },
			data: dto,
		});

		return {
			entityType: template.entityType,
			titleTemplate: template.titleTemplate,
			descriptionTemplate: template.descriptionTemplate,
			availableVariables: [...SEO_TEMPLATE_VARIABLES[entityType]],
		};
	}

	async getMetadata(
		entityType: SeoEntityType,
		entityKey: string,
	): Promise<SeoMetadataDto> {
		const metadata = await this.prismaService.seoMetadata.findUnique({
			where: { entityType_entityKey: { entityType, entityKey } },
		});

		return {
			title: metadata?.title ?? null,
			description: metadata?.description ?? null,
		};
	}

	async resolveMetadata<T extends SeoEntityType>(
		entityType: T,
		entityKey: string,
		values: SeoTemplateVariables<T>,
	): Promise<ResolvedSeoMetadataDto> {
		const strategy = SEO_RESOLVER_REGISTRY[entityType];

		const variables = strategy.buildVariables(values);

		const [template, metadata] = await Promise.all([
			this.getTemplate(entityType),
			this.getMetadata(entityType, entityKey),
		]);

		const title =
			metadata.title?.trim() ||
			this.renderTemplate(template.titleTemplate, variables).trim() ||
			strategy.fallbackTitle(values);
		const description =
			metadata.description?.trim() ||
			this.renderTemplate(template.descriptionTemplate, variables).trim();

		return { title, description };
	}

	async updateMetadata(
		entityType: SeoEntityType,
		entityKey: string,
		dto: SeoMetadataUpdateDto,
	): Promise<SeoMetadataDto> {
		const title = dto.title?.trim() || null;
		const description = dto.description?.trim() || null;

		if (!title && !description) {
			await this.prismaService.seoMetadata.deleteMany({
				where: { entityType, entityKey },
			});
			return { title: null, description: null };
		}

		const metadata = await this.prismaService.seoMetadata.upsert({
			where: { entityType_entityKey: { entityType, entityKey } },
			create: { entityType, entityKey, title, description },
			update: { title, description },
		});

		return {
			title: metadata.title,
			description: metadata.description,
		};
	}

	private getTemplate(entityType: SeoEntityType) {
		return this.prismaService.seoTemplate.findUniqueOrThrow({
			where: { entityType },
		});
	}

	private renderTemplate<T extends SeoEntityType>(
		template: string,
		variables: SeoTemplateVariables<T>,
	) {
		return template.replace(
			/\{\{(\w+)\}\}/g,
			(match, key: SeoTemplateVariable) => variables[key] ?? match,
		);
	}

	private validateTemplate(entityType: SeoEntityType, template: string) {
		const availableVariables: readonly string[] = SEO_TEMPLATE_VARIABLES[entityType];
		const usedVariables = [...template.matchAll(/\{\{(\w+)\}\}/g)].map(
			(match) => match[1],
		);
		const invalidVariable = usedVariables.find(
			(variable) => !availableVariables.includes(variable),
		);

		if (invalidVariable) {
			throw new BadRequestException(
				`Переменная {{${invalidVariable}}} недоступна для шаблона ${entityType}`,
			);
		}
	}
}
