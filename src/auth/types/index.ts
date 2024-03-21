export type JwtPayload = {
	email: string;
	sub: number;
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };

export type Tokens = {
	accessToken: string;
	refreshToken: string;
};
