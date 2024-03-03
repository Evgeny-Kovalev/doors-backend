import { ApiProperty } from '@nestjs/swagger';

export class DeleteFileDto {
	@ApiProperty()
	fileName: string;
}
