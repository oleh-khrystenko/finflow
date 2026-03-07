import { createZodDto } from 'nestjs-zod';
import { UpdateProfileSchema } from '@finflow/types';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
