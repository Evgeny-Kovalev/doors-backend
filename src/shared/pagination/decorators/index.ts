import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationMetaDto } from '../dto';

export const ApiPaginatedResponse = <TModel extends Type>(model: TModel) => {
	return applyDecorators(
		ApiExtraModels(PaginationMetaDto),
		ApiExtraModels(model),
		ApiOkResponse({
			schema: {
				title: `PaginatedResponseOf${model.name}`,
				allOf: [
					{
						properties: {
							data: {
								type: 'array',
								items: { $ref: getSchemaPath(model) },
							},
						},
					},
					{
						properties: {
							meta: {
								type: 'object',
								$ref: getSchemaPath(PaginationMetaDto),
							},
						},
					},
				],
			},
		}),
	);
};
