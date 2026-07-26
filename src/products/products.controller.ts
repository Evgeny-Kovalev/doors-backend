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
} from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiProduces } from '@nestjs/swagger';
import { Public } from '@/app/auth/decorators/public.decorator';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import { PaginationQueryDto } from '@/app/shared/pagination/dto';
import {
	ProductDto,
	ProductWithSeoDto,
	ProductQueryDto,
	RandomProductsQueryDto,
	ProductCreateDto,
	ProductUpdateDto,
	ProductImportDto,
	PaginatedProductDto,
	ExportProductsQueryDto,
} from './dto/product.dto';
import { CategoriesService } from '@/app/categories/categories.service';
import { ApiFileWithBody } from '../files/decorators/api-file.decorator';

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
	@ApiCreatedResponse({ type: [ProductDto] })
	@ApiFileWithBody({
		bodyType: ProductImportDto,
		fileName: 'file',
		required: true,
		mimetype: ['text/csv', 'application/csv'],
	})
	@Post('/import')
	async importProduct(
		@Body() dto: ProductImportDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		this.logger.log('Product import start');

		// const { url: fileUrl } = await this.filesService.uploadFileToS3(file, {
		// 	returnOriginalS3Url: true,
		// });

		const createdProducts: ProductDto[] = await this.productsService.importFromFile(
			dto,
			{ file },
		);

		this.logger.log('Product import end');

		return createdProducts;
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
	@ApiOkResponse({ type: ProductDto })
	@Patch(':slug')
	async update(
		@Param('slug') slug: string,
		@Body() productUpdateDto: ProductUpdateDto,
	): Promise<ProductDto> {
		const updatedProduct = await this.productsService.update(slug, productUpdateDto);
		return updatedProduct;
	}

	@Admin()
	@Delete(':id')
	async delete(@Param('id', ParseIntPipe) id: number): Promise<ProductDto> {
		return await this.productsService.delete(id);
	}
}
