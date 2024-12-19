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
