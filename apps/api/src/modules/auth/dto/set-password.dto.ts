import { createZodDto } from 'nestjs-zod';
import { SetPasswordSchema } from '@finflow/types';

export class SetPasswordDto extends createZodDto(SetPasswordSchema) {}
