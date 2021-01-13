import { plainToClass } from 'class-transformer';
import { IsString, IsUUID, validateSync } from 'class-validator';

export class Environment {
  @IsString()
  readonly RECOMMENDER_BOT_TOKEN: string;

  @IsUUID(4)
  readonly RECOMMENDER_BOT_USER_UUID: string;
}

export function validate(config: Record<string, unknown>): Environment {
  const validatedConfig = plainToClass(Environment, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
