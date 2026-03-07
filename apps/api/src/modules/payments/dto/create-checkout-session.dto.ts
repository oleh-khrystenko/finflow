import { createZodDto } from 'nestjs-zod';
import { CreateCheckoutSessionSchema } from '@finflow/types';

export class CreateCheckoutSessionDto extends createZodDto(
    CreateCheckoutSessionSchema
) {}
