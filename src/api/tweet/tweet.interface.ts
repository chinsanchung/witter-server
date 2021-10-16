import { IMedia } from '../../models/mediaSchema';
import { ITweet } from '../../models/Tweet';
import { IUserForTweetDto } from '../reading/reading.interface';

export interface ICreateDto {
  readonly tweet_id: number;
  readonly user_id: string; // 작성자의 id
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

interface ISingleTweet {
  _id: string;
  tweet_id: number;
  user_id: string;
  video: { key: string; url: string } | null;
  contents: string;
  create_date: Date;
  retweet: string[];
  like: string[];
  comments: number[];
  retweet_count?: number;
  like_count?: number;
  comments_count?: number;
  is_active: boolean;
  image: { key: string; url: string }[];
  user: IUserForTweetDto;
}

export interface IGetTweetsResponseDto {
  origin: ISingleTweet;
  comments?: ISingleTweet[];
}

export interface IDeleteCommentDto {
  orig_tweet_id: number;
  comment_tweet_id: number;
  comment_writer_id: string;
}

export interface ITweetService {
  // 트윗 하나를 클릭했을 때 해당 트윗과 답글들을 출력합니다.
  getTweet(tweet_id: number): Promise<IGetTweetsResponseDto>;

  createTweet(tweet: ICreateDto): Promise<ITweet>;
  deleteTweet(tweet_id: number): Promise<void>;

  doRetweet({ tweet_id, user_id }: ITweetActionDto): Promise<void>;
  unDoRetweet({ tweet_id, user_id }: ITweetActionDto): Promise<void>;
  doLike({ tweet_id, user_id }: ITweetActionDto): Promise<void>;
  unDoLike({ tweet_id, user_id }: ITweetActionDto): Promise<void>;

  addComment({ tweet, target_tweet_id }: ICommentDto): Promise<ITweet>;
  deleteComment({
    orig_tweet_id,
    comment_tweet_id,
    comment_writer_id,
  }: IDeleteCommentDto): Promise<void>;
}
