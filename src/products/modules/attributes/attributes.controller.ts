import { Public } from '@/app/auth/decorators/public.decorator';
import { Admin } from '@/app/auth/decorators/admin.decorator';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import {
	AttributeCreateDto,
	AttributeDto,
	AttributeKeyUpdateDto,
	AttributeValueUpdateDto,
} from './dto';

@ApiTags('Attributes')
@Controller({
	version: '1',
})
export class AttributesController {
	constructor(private readonly attributesService: AttributesService) {}

	@Public()
	@Get('attributes')
	@ApiOkResponse({ type: [AttributeDto] })
	async findAll(): Promise<AttributeDto[]> {
		return this.attributesService.findAll();
	}

	@Admin()
	@Post('attributes')
	@ApiCreatedResponse({ type: AttributeDto })
	create(@Body() dto: AttributeCreateDto) {
		return this.attributesService.create(dto);
	}

	@Admin()
	@Patch('attribute-keys/:id')
	updateKey(@Param('id', ParseIntPipe) id: number, @Body() dto: AttributeKeyUpdateDto) {
		return this.attributesService.updateKey(id, dto);
	}

	@Admin()
	@Patch('attribute-values/:id')
	updateValue(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: AttributeValueUpdateDto,
	) {
		return this.attributesService.updateValue(id, dto);
	}

	@Admin()
	@Delete('attributes/:id')
	@ApiOkResponse({ type: AttributeDto })
	delete(@Param('id', ParseIntPipe) id: number): Promise<AttributeDto> {
		return this.attributesService.delete(id);
	}
}
