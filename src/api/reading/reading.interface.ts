import { ITweet } from '../../models/Tweet';

export interface IGetTweetsResponse {
  origin: ITweet;
  comments?: ITweet[];
}

export interface IReadingService {
  // 트윗 하나를 클릭했을 때 해당 트윗과 답글들을 출력합니다.
  getTweets(tweet_id: number): Promise<IGetTweetsResponse>;
  // 사용자가 트윗, 리트윗, 답글을 달았던 내용을 출력하는 타임라인입니다. user_id 를 매개값으로 합니다.
  getUserTimeLine(user_id: string): Promise<ITweet[]>;
  // 메인 화면에서는 사용자와 팔로잉 중인 사람들의 트윗, 리트윗, 답글을 출력하는 타임라인입니다.
  getHomeTimeLine({
    user_id,
    following,
  }: {
    user_id: string;
    following: string[];
  }): Promise<ITweet[]>;
  // 사용자가 마음에 들어요를 했던 트윗의 목록을 출력하는 타임라인입니다.
  getUserLikeTimeLine(user_id: string): Promise<ITweet[]>;
}
