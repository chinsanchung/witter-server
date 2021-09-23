import { IMedia } from '../../models/mediaSchema';
import { ITweet } from '../../models/Tweet';

export interface CreateDto {
  readonly tweet_id: number;
  readonly writer_id: string; // 작성자의 id
  readonly media: IMedia; // 이미지, 동영상, gif
  readonly contents: string; // 문장
  readonly create_date: Date;
  readonly comments: number[]; // 해당 트윗에 답글 트윗을 단 tweet_id 목록
}

export interface ITweetService {
  createTweet(tweet: CreateDto): Promise<ITweet>;
  deleteTweet(tweet_id: number): Promise<void>;
  // 읽기
  // 답글 달기 sendComment
  // 리트윗 sendRetweet
  // 마음에 들어요 sendLike
  // 삭제 deleteTweet
}
