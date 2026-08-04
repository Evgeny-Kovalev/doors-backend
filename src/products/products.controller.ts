import {
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Body,
	Query,
	ParseIntPipe,
	Logger,
	UploadedFile,
	Res,
	HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import {
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
	ApiProduces,
	ApiExtraModels,
	getSchemaPath,
} from '@nestjs/swagger';
import { Public } from '@/app/auth/decorators/public.decorator';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { PaginationQueryDto } from '@/app/shared/pagination/dto';
import {
	ProductDto,
	ProductWithSeoDto,
	ProductQueryDto,
	RandomProductsQueryDto,
	ProductBulkUpdateDto,
	ProductCreateDto,
	ProductMultipartUpdateDto,
	ProductImportDto,
	ProductImportProgressEventDto,
	ProductImportDoneEventDto,
	ProductImportErrorEventDto,
	PaginatedProductDto,
	ExportProductsQueryDto,
} from './dto/product.dto';
import { CategoriesService } from '@/app/categories/categories.service';
import { ApiFileWithBody } from '../files/decorators/api-file.decorator';
import type { ProductImportEvent } from '@/contracts';

@ApiTags('Products')
@Controller({
	path: 'products',
	version: '1',
})
export class ProductsController {
	constructor(
		private readonly productsService: ProductsService,
		private readonly categoriesService: CategoriesService,
	) {}

	private readonly logger = new Logger(ProductsController.name);

	@Public()
	@Get('/')
	@ApiOkResponse({ type: PaginatedProductDto })
	async getAllProducts(
		@Query() query: ProductQueryDto,
		@Query() paginationDto: PaginationQueryDto,
	): Promise<PaginatedProductDto> {
		const { page, limit } = paginationDto;

		return await this.productsService.getAll(query, {
			page,
			limit,
		});
	}

	@Public()
	@ApiOkResponse({ type: [ProductDto] })
	@Get('/random')
	async getRandomProducts(
		@Query() query: RandomProductsQueryDto,
	): Promise<ProductDto[]> {
		const category = await this.categoriesService.getBySlug(query.categorySlug);
		return this.productsService.getRandom({
			category,
			limit: query.limit,
		});
	}

	@Admin()
	@ApiProduces('text/csv')
	@ApiOkResponse({
		description: 'CSV export of product variants',
		content: {
			'text/csv': {
				schema: { type: 'string', format: 'binary' },
			},
		},
	})
	@Get('/export')
	async exportProducts(
		@Query() dto: ExportProductsQueryDto,
		@Res({ passthrough: true }) response: Response,
	): Promise<string> {
		await this.categoriesService.getBySlug(dto.categorySlug, {
			includeHidden: true,
		});

		const csvContent = await this.productsService.exportProductsToCSV(dto);
		const fileName = `products-${dto.categorySlug}.csv`;

		response.setHeader('Content-Type', 'text/csv; charset=utf-8');
		response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
		return csvContent;
	}

	@Admin()
	@ApiExtraModels(
		ProductImportProgressEventDto,
		ProductImportDoneEventDto,
		ProductImportErrorEventDto,
	)
	@ApiProduces('text/event-stream')
	@ApiOkResponse({
		description:
			'SSE stream of import events (progress / done / error). Each event is sent as `event: <type>` with JSON `data`.',
		content: {
			'text/event-stream': {
				schema: {
					oneOf: [
						{ $ref: getSchemaPath(ProductImportProgressEventDto) },
						{ $ref: getSchemaPath(ProductImportDoneEventDto) },
						{ $ref: getSchemaPath(ProductImportErrorEventDto) },
					],
				},
			},
		},
	})
	@ApiFileWithBody({
		bodyType: ProductImportDto,
		fileName: 'file',
		required: true,
		mimetype: ['text/csv', 'application/csv'],
	})
	@Post('/import')
	async importProducts(
		@Body() dto: ProductImportDto,
		@UploadedFile() file: Express.Multer.File,
		@Res() res: Response,
	) {
		this.logger.log('Product import start');

		res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
		res.setHeader('Cache-Control', 'no-cache, no-transform');
		res.setHeader('Connection', 'keep-alive');
		res.setHeader('X-Accel-Buffering', 'no');
		res.flushHeaders();

		const writeEvent = (event: ProductImportEvent) => {
			res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
		};

		try {
			for await (const event of this.productsService.importFromFile(dto, {
				file,
			})) {
				writeEvent(event);
			}
		} catch (error) {
			this.logger.error(error);
			writeEvent({
				type: 'error',
				message: this.getImportErrorMessage(error),
			});
		} finally {
			res.end();
			this.logger.log('Product import end');
		}
	}

	@Public()
	@ApiOkResponse({ type: ProductWithSeoDto })
	@Get(':slug')
	async getProductWithSeo(@Param('slug') slug: string): Promise<ProductWithSeoDto> {
		return this.productsService.getProductWithSeoBySlug(slug);
	}

	@Admin()
	@ApiCreatedResponse({ type: ProductDto })
	@Post('/')
	async createProduct(@Body() dto: ProductCreateDto): Promise<ProductDto> {
		const product = await this.productsService.createOne(dto);
		return product;
	}

	@Admin()
	@ApiOkResponse({ type: [ProductDto] })
	@Patch('/')
	async updateMany(@Body() dto: ProductBulkUpdateDto): Promise<ProductDto[]> {
		return this.productsService.updateMany(dto);
	}

	@Admin()
	@ApiOkResponse({ type: ProductDto })
	@ApiFileWithBody({
		bodyType: ProductMultipartUpdateDto,
		fileName: 'image',
		required: false,
		mimetype: ['image'],
	})
	@Patch(':slug')
	async update(
		@Param('slug') slug: string,
		@Body() productUpdateDto: ProductMultipartUpdateDto,
		@UploadedFile() image?: Express.Multer.File,
	): Promise<ProductDto> {
		return this.productsService.update(slug, productUpdateDto, image);
	}

	@Admin()
	@Delete(':id')
	async delete(@Param('id', ParseIntPipe) id: number): Promise<ProductDto> {
		return await this.productsService.delete(id);
	}

	private getImportErrorMessage(error: unknown): string {
		if (error instanceof HttpException) {
			const response = error.getResponse();
			if (typeof response === 'string') return response;
			if (typeof response === 'object' && response !== null && 'message' in response) {
				const message = (response as { message: string | string[] }).message;
				return Array.isArray(message) ? message.join(', ') : message;
			}
		}
		if (error instanceof Error) return error.message;
		return 'Import failed';
	}
}
