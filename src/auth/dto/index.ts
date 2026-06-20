import { createZodDto } from '@/app/shared/create-zod-dto';
import { AuthSchema } from '@/contracts';

export class AuthDto extends createZodDto(AuthSchema) {}
