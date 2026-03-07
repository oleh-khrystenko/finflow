import { createZodDto } from 'nestjs-zod';
import { VerifyPasswordSchema } from '@finflow/types';

export class VerifyPasswordDto extends createZodDto(VerifyPasswordSchema) {}
