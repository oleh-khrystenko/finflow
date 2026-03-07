import { createZodDto } from 'nestjs-zod';
import { ChangePasswordSchema } from '@finflow/types';

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
