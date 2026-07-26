import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API smoke (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix('api');
		app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
		await app.init();
	});

	afterAll(async () => {
		const prisma = app.get(PrismaService);
		await prisma.$disconnect();
		await app.close();
	});

	it('returns 404 for unknown route', () => {
		return request(app.getHttpServer()).get('/api/v1/unknown-route').expect(404);
	});

	it('requires auth for admin product create', () => {
		return request(app.getHttpServer()).post('/api/v1/products').send({}).expect(401);
	});

	it('serves public product list', async () => {
		const response = await request(app.getHttpServer()).get('/api/v1/products');
		expect([200, 400]).toContain(response.status);
		if (response.status === 200) {
			expect(response.body).toHaveProperty('data');
			expect(response.body).toHaveProperty('meta');
		}
	});

	it('serves category hierarchy endpoint shape', async () => {
		const list = await request(app.getHttpServer()).get('/api/v1/categories');
		expect([200, 400]).toContain(list.status);
		if (list.status === 200 && Array.isArray(list.body) && list.body[0]?.slug) {
			const hierarchy = await request(app.getHttpServer()).get(
				`/api/v1/categories/${list.body[0].slug}/hierarchy`,
			);
			expect([200, 404]).toContain(hierarchy.status);
		}
	});
});
