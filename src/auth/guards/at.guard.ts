import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
	constructor(private reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		// Always attempt JWT so public endpoints can still recognize an admin
		// when an access-token cookie is present.
		return super.canActivate(context);
	}

	handleRequest<TUser>(
		err: Error | null,
		user: TUser,
		info: unknown,
		context: ExecutionContext,
		status?: unknown,
	): TUser {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			// Missing/invalid token is fine on public routes - treat as anonymous.
			if (err || !user) return undefined as TUser;
			return user;
		}

		return super.handleRequest(err, user, info, context, status);
	}
}
