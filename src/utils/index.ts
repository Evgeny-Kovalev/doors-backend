export const groupBy = <T>(
	array: T[],
	predicate: (value: T, index: number, array: T[]) => string,
) =>
	array.reduce(
		(acc, value, index, array) => {
			(acc[predicate(value, index, array)] ||= []).push(value);
			return acc;
		},
		{} as { [key: string]: T[] },
	);

export const arrayOfAll =
	<T>() =>
	<U extends T[]>(array: U & ([T] extends [U[number]] ? unknown : 'Invalid')) =>
		array;

export async function mapWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
	if (items.length === 0) return [];

	const results: R[] = new Array(items.length);
	let nextIndex = 0;

	const workers = Array.from(
		{ length: Math.min(concurrency, items.length) },
		async () => {
			while (nextIndex < items.length) {
				const current = nextIndex++;
				results[current] = await mapper(items[current], current);
			}
		},
	);

	await Promise.all(workers);
	return results;
}
