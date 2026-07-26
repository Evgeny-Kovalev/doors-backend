import { Injectable } from '@nestjs/common';
import { PaginatedDto, PaginationQueryDto } from '@/app/shared/pagination/dto';
import {
	ImportTemplate,
	ProductCreateDto,
	ProductWithSeoDto,
	ProductDto,
	ProductImportDto,
	ProductUpdateDto,
	ExportProductsQueryDto,
} from './dto/product.dto';
import { CategoryDto } from '../categories/dto';
import { ProductVariantFromFile } from './types';
import { ProductsQueryService } from './services/products-query.service';
import { ProductsCommandService } from './services/products-command.service';
import { ImportService } from './services/import.service';
import { VisibilityOptions } from '@/app/shared/visibility';
import type { ProductQueryParsed } from '@/contracts';

@Injectable()
export class ProductsService {
	constructor(
		private readonly productsQueryService: ProductsQueryService,
		private readonly productsCommandService: ProductsCommandService,
		private readonly importService: ImportService,
	) {}

	getAll(
		query: ProductQueryParsed,
		pagination: PaginationQueryDto,
		options?: VisibilityOptions,
	): Promise<PaginatedDto<ProductDto>> {
		return this.productsQueryService.getAll(query, pagination, options);
	}

	getRandom(params: {
		category: CategoryDto;
		limit: number;
		includeHidden?: boolean;
	}): Promise<ProductDto[]> {
		return this.productsQueryService.getRandom(params);
	}

	getById(id: number): Promise<ProductDto> {
		return this.productsQueryService.getById(id);
	}

	getBySlug(slug: string, options?: VisibilityOptions): Promise<ProductDto> {
		return this.productsQueryService.getBySlug(slug, options);
	}

	getProductWithSeoBySlug(
		slug: string,
		options?: VisibilityOptions,
	): Promise<ProductWithSeoDto> {
		return this.productsQueryService.getProductWithSeoBySlug(slug, options);
	}

	createOne(dto: ProductCreateDto): Promise<ProductDto> {
		return this.productsCommandService.createOne(dto);
	}

	update(slug: string, dto: ProductUpdateDto): Promise<ProductDto> {
		return this.productsCommandService.update(slug, dto);
	}

	delete(id: number): Promise<ProductDto> {
		return this.productsCommandService.delete(id);
	}

	importFromFile(
		dto: ProductImportDto,
		files: { file: Express.Multer.File },
	): Promise<ProductDto[]> {
		return this.importService.importFromFile(dto, files);
	}

	getProductDtoFromFile(
		productVariantsFromFile: ProductVariantFromFile[],
		category: CategoryDto,
		template: ImportTemplate,
	): Promise<ProductCreateDto> {
		return this.importService.getProductDtoFromFile(
			productVariantsFromFile,
			category,
			template,
		);
	}

	exportProductsToCSV(dto: ExportProductsQueryDto): Promise<string> {
		return this.importService.exportProductsToCSV(dto);
	}
}
