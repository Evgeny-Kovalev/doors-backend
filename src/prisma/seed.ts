import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
const prisma = new PrismaClient();

async function main() {
	const categories = await prisma.category.createMany({
		data: [
			{
				id: 1,
				name: 'Двери межкомнатные',
				slug: slugify('Двери межкомнатные', { lower: true }),
				imgUrl: 'http://localhost:4000/images/category.png',
				description: 'test',
				categoryType: 'interiorDoors',
			},
			{
				id: 2,
				slug: slugify('Двери входные', { lower: true }),
				name: 'Двери входные',
				imgUrl: 'http://localhost:4000/images/category.png',
				description: 'test',
				categoryType: 'exteriorDoors',
			},
		],
	});
	const collections = await prisma.collection.createMany({
		data: [
			{ id: 1, title: 'Входные популяные' },
			{ id: 2, title: 'Межкомнатные популяные' },
			{ id: 3, title: 'Межкомнатные образцы' },
			{ id: 4, title: 'Двери РБ Могилев' },
			{ id: 5, title: 'Избранные категории' },
		],
	});
	console.log({ categories, collections });
}
main()
	.catch((e) => console.error(e))
	.finally(async () => {
		await prisma.$disconnect();
	});
