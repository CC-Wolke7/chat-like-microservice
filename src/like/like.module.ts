import { Module, Provider } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { ProviderToken } from '../provider';
import { BigtableLikeStorage } from './storage/bigtable/bigtable-like.storage';
import { AuthModule } from '../app/auth/auth.module';
import { ConfigModule } from '../app/config/config.module';

const LikeStorageProvider: Provider = {
  provide: ProviderToken.LIKE_STORAGE,
  useClass: BigtableLikeStorage,
};

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [LikeController],
  providers: [LikeService, LikeStorageProvider],
})
export class LikeModule {}
