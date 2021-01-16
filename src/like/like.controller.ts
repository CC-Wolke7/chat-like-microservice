import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../app/auth/interfaces/user';
import { ServiceTokenGuard } from '../app/auth/strategy/service-token/service-token.guard';
import { User } from '../app/auth/user.decorator';
import { OfferUUID } from './interfaces/storage';
import { GetOfferLikesResponse } from './like.dto';
import { LikeService } from './like.service';

// @TODO: add JWT guard
@UseGuards(ServiceTokenGuard)
@ApiTags('like')
@Controller()
export class LikeController {
  // MARK: - Private Properties
  private readonly service: LikeService;

  // MARK: - Initialization
  constructor(service: LikeService) {
    this.service = service;
  }

  // MARK: - Routes
  @Get('offer/:offerId/likes')
  async getOfferLikes(
    @Param('offerId', ParseUUIDPipe) offer: OfferUUID,
    @User() user: AuthenticatedUser,
  ): Promise<GetOfferLikesResponse> {
    const offerLikes = await this.service.getOfferLikes(offer);
    const userLike = await this.service.getOfferLike(offer, user.uuid);

    return {
      total: offerLikes.votes.up,
      user: userLike,
    };
  }

  @Put('offer/:offerId/likes')
  async toggleOfferLike(
    @Param('offerId', ParseUUIDPipe) offer: OfferUUID,
    @User() user: AuthenticatedUser,
  ): Promise<void> {
    return this.service.toggleOfferLike(offer, user.uuid);
  }
}
