import { PickType } from '@nestjs/mapped-types';
import { Tweet } from 'src/entities/tweet.entity';

export class CreateTweetInputDto extends PickType(Tweet, ['contents']) {}
