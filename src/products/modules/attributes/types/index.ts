import { Prisma } from '@prisma/client';

const attributeAllData = Prisma.validator<Prisma.AttributeDefaultArgs>()({});

export interface AttributeFullData
	extends Prisma.AttributeGetPayload<typeof attributeAllData> {}
