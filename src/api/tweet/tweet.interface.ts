import { IMedia } from '../../models/mediaSchema';
import { ITweet } from '../../models/Tweet';

export interface ICreateDto {
  readonly tweet_id: number;
  readonly writer_id: string; // 작성자의 id
  image?: IMedia[];
  video?: IMedia;
  readonly contents: string; // 문장
  readonly create_date: Date;
  readonly comments: number[]; // 해당 트윗에 답글 트윗을 단 tweet_id 목록
}

export interface ITweetActionDto {
  readonly tweet_id: number;
  readonly user_id: string;
  readonly action_type: 'retweet' | 'like';
  readonly action: 'do' | 'undo';
}

export interface ITweetService {
  createTweet(tweet: ICreateDto): Promise<ITweet>;
  deleteTweet(tweet_id: number): Promise<void>;
  doTweetAction({
    tweet_id,
    user_id,
    action_type,
    action,
  }: ITweetActionDto): Promise<void>;
  // reTweet({ tweet_id, user_id, action }: ITweetActionDto): Promise<void>;
  // likeTweet({ tweet_id, user_id, action }: ITweetActionDto): Promise<void>;
  // 마음에 들어요 doLike
  // unDoLike
}
