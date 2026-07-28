import { Injectable } from '@nestjs/common';
import { PaginatedDto, PaginationQueryDto } from '@/app/shared/pagination/dto';
import {
	ProductCreateDto,
	ProductWithSeoDto,
	ProductDto,
	ProductImportDto,
	ProductUpdateDto,
	ExportProductsQueryDto,
} from './dto/product.dto';
import { CategoryDto } from '../categories/dto';
import { ProductsQueryService } from './services/products-query.service';
import { ProductsCommandService } from './services/products-command.service';
import { ProductsImportService } from './services/products-import.service';
import { ProductsExportService } from './services/products-export.service';
import { VisibilityOptions } from '@/app/shared/visibility';
import type { ProductImportEvent, ProductQueryParsed } from '@/contracts';

@Injectable()
export class ProductsService {
	constructor(
		private readonly productsQueryService: ProductsQueryService,
		private readonly productsCommandService: ProductsCommandService,
		private readonly productsImportService: ProductsImportService,
		private readonly productsExportService: ProductsExportService,
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
	): AsyncGenerator<ProductImportEvent> {
		return this.productsImportService.importFromFile(dto, files);
	}

	exportProductsToCSV(dto: ExportProductsQueryDto): Promise<string> {
		return this.productsExportService.exportProductsToCSV(dto);
	}
}
