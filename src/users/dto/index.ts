import { createZodDto } from 'nestjs-zod';
import { UserCreateSchema, UserSchema, UserUpdateSchema } from '../../../contracts';

export class UserDto extends createZodDto(UserSchema) {}
export class UserCreateDto extends createZodDto(UserCreateSchema) {}
export class UserUpdateDto extends createZodDto(UserUpdateSchema) {}
