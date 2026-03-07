import { createZodDto } from 'nestjs-zod';

import { VerifyMagicLinkSchema } from '@finflow/types';

export class VerifyMagicLinkDto extends createZodDto(VerifyMagicLinkSchema) {}
