import { createZodDto } from 'nestjs-zod';
import { AuthSchema } from '../../../contracts';

export class AuthDto extends createZodDto(AuthSchema) {}
