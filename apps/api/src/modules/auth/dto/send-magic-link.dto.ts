import { createZodDto } from 'nestjs-zod';

import { SendMagicLinkSchema } from '@finflow/types';

export class SendMagicLinkDto extends createZodDto(SendMagicLinkSchema) {}
