import { createZodDto } from 'nestjs-zod';
import { LoginPasswordSchema } from '@finflow/types';

export class LoginPasswordDto extends createZodDto(LoginPasswordSchema) {}
