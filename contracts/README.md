# @evgeny-kovalev/api-contracts

Shared, framework-agnostic Zod schemas and inferred TypeScript types.

## Usage

```ts
import {
	ProductSchema,
	type ProductResponse,
} from '@evgeny-kovalev/api-contracts';
```

Keep this package limited to the HTTP boundary. NestJS DTOs, Prisma models,
React form schemas, and contracts of external services belong to their
respective applications.

## Versioning

The package follows semantic versioning:

- patch: validation metadata or non-breaking corrections;
- minor: backward-compatible fields and schemas;
- major: removed, renamed, or newly required fields.

Build and validate it from the backend workspace:

```sh
pnpm --filter @evgeny-kovalev/api-contracts check
pnpm --filter @evgeny-kovalev/api-contracts build
```
