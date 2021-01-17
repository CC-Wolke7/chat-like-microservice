import { plainToClass, Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';
import { ChatStorageProviderType } from '../../chat/chat.module';
import { LikeStorageProviderType } from '../../like/like.module';
import { Plugin } from '../../plugins';

export class Environment {
  // Core Config
  @IsOptional()
  @Transform((value: string) => value.split(',')) // must be applied again upon usage
  @IsArray()
  @ArrayUnique()
  @IsEnum(Plugin, { each: true })
  readonly PLUGINS?: string;

  @IsString()
  readonly GCP_PROJECT_ID: string;

  // Service Account Config
  @IsString()
  readonly RECOMMENDER_BOT_TOKEN: string;

  @IsUUID(4)
  readonly RECOMMENDER_BOT_USER_UUID: string;

  // Chat Config
  @IsOptional()
  @IsEnum(ChatStorageProviderType)
  readonly CHAT_STORAGE?: ChatStorageProviderType;

  @IsOptional()
  @IsString()
  readonly CHAT_FIRESTORE_HOST?: string;

  @IsOptional()
  @IsNumber()
  readonly CHAT_FIRESTORE_PORT?: number;

  // Like Config
  @IsOptional()
  @IsEnum(LikeStorageProviderType)
  readonly LIKE_STORAGE?: LikeStorageProviderType;

  @IsOptional()
  @IsString()
  readonly LIKE_BIGTABLE_INSTANCE_ID?: string;

  @IsOptional()
  @IsString()
  readonly LIKE_BIGTABLE_HOST?: string;

  @IsOptional()
  @IsNumber()
  readonly LIKE_BIGTABLE_PORT?: number;
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
