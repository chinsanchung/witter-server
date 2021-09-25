import { IMedia } from '../../models/mediaSchema';
import { ITweet } from '../../models/Tweet';

export interface ICreateDto {
  readonly tweet_id: number;
  readonly writer_id: string; // 작성자의 id
  image?: IMedia[];
  video?: IMedia;
  readonly contents: string; // 문장
  readonly create_date: Date;
  readonly comments?: number[]; // 해당 트윗에 답글 트윗을 단 tweet_id 목록
}

export interface ITweetActionDto {
  readonly tweet_id: number;
  readonly user_id: string;
}

export interface ICommentDto {
  tweet: ICreateDto;
  target_tweet_id: number;
}

export interface ITweetService {
  createTweet(tweet: ICreateDto): Promise<ITweet>;
  deleteTweet(tweet_id: number): Promise<void>;

  doRetweet({ tweet_id, user_id }: ITweetActionDto): Promise<void>;
  unDoRetweet({ tweet_id, user_id }: ITweetActionDto): Promise<void>;
  doLike({ tweet_id, user_id }: ITweetActionDto): Promise<void>;
  unDoLike({ tweet_id, user_id }: ITweetActionDto): Promise<void>;

  addCommentTweet({ tweet, target_tweet_id }: ICommentDto): Promise<ITweet>;
  deleteCommentTweet(
    orig_tweet_id: number,
    comment_tweet_id: number,
    comment_writer_id: string
  ): Promise<void>;
}
