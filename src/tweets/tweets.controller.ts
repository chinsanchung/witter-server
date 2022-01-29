import {
  Body,
  Controller,
  Delete,
  HttpException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserParam } from 'src/auth/decorators/user.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { User } from 'src/entities/user.entity';
import { CreateTweetInputDto } from './dtos/create-tweet.dto';
import { TweetsService } from './tweets.service';

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async createTweet(
    @UserParam() user: User,
    @Body() payload: CreateTweetInputDto,
  ) {
    const { ok, data, httpStatus, error } =
      await this.tweetsService.createTweet({
        user,
        payload,
      });

    if (ok) {
      return { data };
    }
    throw new HttpException(error, httpStatus);
  }

  @Delete('/:tweetId')
  @UseGuards(AccessTokenGuard)
  async deleteTweet(
    @UserParam() user: User,
    @Param('tweetId') tweetId: number,
  ) {
    const { ok, httpStatus, error } = await this.tweetsService.deleteTweet({
      user,
      tweetId,
    });

    if (ok) {
      return { message: '삭제를 완료했습니다.' };
    }
    throw new HttpException(error, httpStatus);
  }
}
