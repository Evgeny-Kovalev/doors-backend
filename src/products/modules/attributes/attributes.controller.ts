import { Public } from 'src/auth/decorators/public.decorator';
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
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

	@ApiBearerAuth()
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Post('attributes')
	@ApiCreatedResponse({ type: AttributeDto })
	create(@Body() dto: AttributeCreateDto) {
		return this.attributesService.create(dto);
	}

	@ApiBearerAuth()
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Patch('attribute-keys/:id')
	updateKey(@Param('id', ParseIntPipe) id: number, @Body() dto: AttributeKeyUpdateDto) {
		return this.attributesService.updateKey(id, dto);
	}

	@ApiBearerAuth()
	@HasRoles(Role.ADMIN)
	@UseGuards(RolesGuard)
	@Patch('attribute-values/:id')
	updateValue(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: AttributeValueUpdateDto,
	) {
		return this.attributesService.updateValue(id, dto);
	}
}
