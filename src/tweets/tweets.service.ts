import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IOutputWithData } from 'src/common/output.interface';
import { Tweet } from 'src/entities/tweet.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTweetInputDto } from './dtos/create-tweet.dto';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweets: Repository<Tweet>,
  ) {}

  async createTweet({
    user,
    payload,
  }: {
    user: User;
    payload: CreateTweetInputDto;
  }): Promise<IOutputWithData<Tweet>> {
    try {
      const newTweet = this.tweets.create({
        user,
        ...payload,
      });
      await this.tweets.save(newTweet);
      return { ok: true, data: newTweet };
    } catch (error) {
      return {
        ok: false,
        httpStatus: 500,
        error: '트윗 생성 과정에서 에러가 발생했습니다.',
      };
    }
  }
}
