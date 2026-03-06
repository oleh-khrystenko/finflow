import { createZodDto } from 'nestjs-zod';

import { UpdateLangSchema } from '@finflow/types';

export class UpdateLangDto extends createZodDto(UpdateLangSchema) {}
