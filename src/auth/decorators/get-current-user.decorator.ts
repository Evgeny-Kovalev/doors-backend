import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithRt } from '../../auth/types';

export const GetCurrentUser = createParamDecorator(
	(data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest();
		const user = request.user as JwtPayloadWithRt | undefined;

		if (!data) return user;
		return user?.[data];
	},
);
