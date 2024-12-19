import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	email: string;
}

export class UserCreateDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	email: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	password: string;

	@ApiPropertyOptional()
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	refreshToken?: string | null;
}

export class UserUpdateDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	password?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	refreshToken?: string | null;
}
