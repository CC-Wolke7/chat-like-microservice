import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
// import { AppGateway } from './app.gateway';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [
    // must be disabled or deployed as second app until multiple independent WSS are supported
    // https://github.com/nestjs/nest/issues/3397
    // AppGateway,
  ],
})
export class AppModule {}
