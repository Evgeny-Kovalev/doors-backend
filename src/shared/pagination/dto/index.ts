import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Min, IsInt, Max } from 'class-validator';

export class PaginationMetaDto {
	@ApiProperty()
	readonly page: number;

	@ApiProperty()
	readonly limit: number;

	@ApiProperty()
	readonly itemCount: number;

	@ApiProperty()
	readonly pageCount: number;

	@ApiProperty()
	readonly hasPreviousPage: boolean;

	@ApiProperty()
	readonly hasNextPage: boolean;

	constructor(page: number, limit: number, itemCount: number) {
		this.page = page;
		this.limit = limit;
		this.itemCount = itemCount;
		this.pageCount = Math.ceil(this.itemCount / this.limit);
		this.hasPreviousPage = this.page > 1;
		this.hasNextPage = this.page < this.pageCount;
	}
}

export class PaginatedDto<T> {
	readonly data: T[];

	readonly meta: PaginationMetaDto;

	constructor(data: T[], page: number, limit: number, itemCount: number) {
		this.data = data;
		this.meta = new PaginationMetaDto(page, limit, itemCount);
	}
}

export class PaginationParamsDto {
	@ApiPropertyOptional({
		minimum: 1,
		default: 1,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	readonly page: number = 1;

	@ApiPropertyOptional({
		minimum: 1,
		maximum: 60,
		default: 20,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(60)
	@IsOptional()
	readonly limit: number = 20;
}
