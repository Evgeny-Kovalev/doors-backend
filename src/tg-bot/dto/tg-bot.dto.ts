import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TgBotCallbackDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	phone: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	name: string;
}
