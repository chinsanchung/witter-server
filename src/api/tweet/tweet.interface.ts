import { IMedia } from '../../models/mediaSchema';
import { ITweet } from '../../models/Tweet';

export interface CreateDto {
  readonly tweet_id: number;
  readonly writer_id: string; // 작성자의 id
  image?: IMedia[];
  video?: IMedia;
  readonly contents: string; // 문장
  readonly create_date: Date;
  readonly comments: number[]; // 해당 트윗에 답글 트윗을 단 tweet_id 목록
}

export interface ITweetService {
  createTweet(tweet: CreateDto): Promise<ITweet>;
  deleteTweet(tweet_id: number): Promise<void>;
  // 답글 달기 sendComment
  // 리트윗 retweet
  // 마음에 들어요 sendLike
}
