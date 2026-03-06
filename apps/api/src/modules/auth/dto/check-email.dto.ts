import { createZodDto } from 'nestjs-zod';
import { CheckEmailSchema } from '@finflow/types';

export class CheckEmailDto extends createZodDto(CheckEmailSchema) {}
