import { DynamicModule, Provider, Type } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { ProviderToken } from '../provider';
import { BigtableLikeStorage } from './storage/bigtable/bigtable-like.storage';
import { AuthModule } from '../app/auth/auth.module';
import { ConfigModule } from '../app/config/config.module';
import { InMemoryLikeStorage } from './storage/memory/memory-like.storage';
import { PluginFactory } from '../plugins';
import { LikeStorageProviderType } from './like.storage';

const CLASS_FOR_LIKE_STORAGE_PROVIDER_TYPE: Record<
  LikeStorageProviderType,
  Type<any>
> = {
  [LikeStorageProviderType.InMemory]: InMemoryLikeStorage,
  [LikeStorageProviderType.Bigtable]: BigtableLikeStorage,
};

export interface LikeFactoryOptions {
  storage: LikeStorageProviderType;
}

export class LikeModuleFactory implements PluginFactory {
  // MARK: - Public Methods
  create(options: LikeFactoryOptions): DynamicModule {
    const storageProvider = this.getStorageProvider(options.storage);

    return {
      module: LikeModule,
      imports: [AuthModule, ConfigModule],
      controllers: [LikeController],
      providers: [LikeService, storageProvider],
    };
  }

  // MARK: - Private Methods
  private getStorageProvider(type: LikeStorageProviderType): Provider {
    return {
      provide: ProviderToken.LIKE_STORAGE,
      useClass: CLASS_FOR_LIKE_STORAGE_PROVIDER_TYPE[type],
    };
  }
}

class LikeModule {}
