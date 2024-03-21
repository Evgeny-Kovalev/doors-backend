import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	email: string;
}

export class UserCreateDto {
	@ApiProperty()
	@IsString()
	email: string;

	@ApiProperty()
	@IsString()
	password: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	refreshToken?: string | null;
}

export class UserUpdateDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	password?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	refreshToken?: string | null;
}
