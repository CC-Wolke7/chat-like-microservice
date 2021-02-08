import { plainToClass } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';
import { TransformToStringArray } from '../../util/decorator';
import { ChatStorageProviderType } from '../../chat/chat.storage';
import { LikeStorageProviderType } from '../../like/like.storage';
import { Plugin } from '../../plugins';
import { Stage } from './stage';

export class Environment {
  // Global
  @IsEnum(Stage)
  readonly NODE_ENV: Stage;

  // Core Config
  @IsOptional()
  @TransformToStringArray() // must be applied again upon usage
  @IsArray()
  @ArrayUnique()
  @IsEnum(Plugin, { each: true })
  readonly PLUGINS?: string;

  @IsString()
  readonly VET_SHELTER_API_URL: string;

  @IsOptional()
  @IsString()
  readonly GCP_PROJECT_ID?: string;

  @IsOptional()
  @TransformToStringArray() // must be applied again upon usage
  @IsArray()
  @ArrayUnique()
  readonly CORS_ORIGIN_WHITELIST?: string;

  @IsOptional()
  @IsBooleanString()
  readonly CORS_ALLOW_CREDENTIALS?: string;

  @IsOptional()
  readonly SERVER_HOSTNAME?: string;

  @IsOptional()
  @IsNumber()
  readonly SERVER_PORT?: number;

  // Service Account Config
  @IsOptional()
  @IsString()
  readonly RECOMMENDER_BOT_TOKEN?: string;

  @IsOptional()
  @IsUUID(4)
  readonly RECOMMENDER_BOT_USER_UUID?: string;

  // Chat Config
  @IsOptional()
  @IsEnum(ChatStorageProviderType)
  readonly CHAT_STORAGE?: ChatStorageProviderType;

  @IsOptional()
  @IsBooleanString()
  readonly CHAT_BROKER_ENABLED?: string;

  @IsOptional()
  @IsString()
  readonly CHAT_FIRESTORE_HOST?: string;

  @IsOptional()
  @IsNumber()
  readonly CHAT_FIRESTORE_PORT?: number;

  @IsOptional()
  @IsUUID(4)
  readonly CHAT_REDIS_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  readonly CHAT_REDIS_HOST?: string;

  @IsOptional()
  @IsNumber()
  readonly CHAT_REDIS_PORT?: number;

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
