import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	const categories = await prisma.category.createMany({
		data: [
			{
				id: 1,
				name: 'Двери межкомнатные',
				imgUrl: 'http://localhost:4000/images/category.png',
				description: 'test',
				categoryType: 'interiorDoors',
			},
			{
				id: 2,
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
