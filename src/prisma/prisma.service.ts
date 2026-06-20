import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { EnvService } from '@/app/env/env.service';
import { PrismaClient } from '@/app/generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor(envService: EnvService) {
		const adapter = new PrismaPg({
			connectionString: envService.get('DATABASE_URL'),
		});
		super({ adapter });
	}

	async onModuleInit() {
		await this.$connect();
	}
}
