import type { Config } from 'jest';

const config: Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '../',
	roots: ['test/'],
	testEnvironment: 'node',
	testRegex: '.e2e-spec.ts$',
	transform: {
		'^.+\\.(t|j)s$': [
			'ts-jest',
			{
				tsconfig: {
					types: ['jest', 'node'],
				},
			},
		],
	},
	moduleNameMapper: {
		'^@/app/(.*)$': '<rootDir>/src/$1',
		'^src/(.*)$': '<rootDir>/src/$1',
		'^@/contracts$': '<rootDir>/src/contracts.ts',
		'^@evgeny-kovalev/api-contracts$': '<rootDir>/contracts/index.ts',
	},
};

export default config;
