import createError from '../../utils/createError';
import { TweetModel, ITweet } from '../../models/Tweet';
import Debugger from '../../utils/debugger';
import {
  ICreateDto,
  ITweetActionDto,
  ICommentDto,
  ITweetService,
} from './tweet.interface';

export default class TweetService implements ITweetService {
  private checkTweetExistence = async (tweet_id: number): Promise<boolean> => {
    const response = await TweetModel.findOne({ tweet_id })
      .select('tweet_id')
      .lean();
    if (response) {
      return true;
    } else return false;
  };

  createTweet = async (tweet: ICreateDto): Promise<ITweet> => {
    try {
      // Debugger.log('서비스에서 트윗 생성');
      const newTweet = await TweetModel.create(tweet);
      Debugger.log('새 트윗', newTweet);
      return newTweet;
    } catch (error) {
      Debugger.error('트윗 생성 에러: ', error);
      throw createError(500, '트윗 생성 과정에서 에러가 발생했습니다.');
    }
  };
  deleteTweet = async (tweet_id: number): Promise<void> => {
    try {
      const response = await TweetModel.findOneAndUpdate(
        { tweet_id },
        { $set: { is_active: false } }
      );
      Debugger.log('삭제 결과', response);
      if (response) {
        // TODO: 이미지나 동영상 삭제 기능 추가하기
        return;
      } else {
        throw createError(404, '존재하지 않는 트윗입니다.');
      }
    } catch (error) {
      throw error;
    }
  };
  doTweetAction = async ({
    tweet_id,
    user_id,
    action_type,
    action,
  }: ITweetActionDto): Promise<void> => {
    try {
      const isExistTweet = await this.checkTweetExistence(tweet_id);
      if (!isExistTweet) {
        throw createError(
          404,
          '존재하지 않는 트윗에는 해당 기능을 수행할 수 없습니다.'
        );
      } else {
        let modifiedCount: number = 0;
        if (action === 'do') {
          Debugger.log(action_type, ' 시작');
          const response: { modifiedCount: number } =
            await TweetModel.updateOne(
              { tweet_id },
              { $push: { [`${action_type}`]: user_id } }
            );
          modifiedCount = response.modifiedCount;
        } else {
          Debugger.log(action_type, ' 취소');
          const response: { modifiedCount: number } =
            await TweetModel.updateOne(
              { tweet_id },
              { $pull: { [`${action_type}`]: user_id } }
            );
          modifiedCount = response.modifiedCount;
        }
        Debugger.log(action_type, ' ', action, ' 결과: ', modifiedCount);
        if (modifiedCount === 1) {
          return;
        } else {
          throw createError(404, '이미 취소한 것을 다시 취소하실 수 없습니다.');
        }
      }
    } catch (error) {
      throw error; // createError 로 나온 것.
    }
  };
  addCommentTweet = async ({
    tweet,
    target_tweet_id,
  }: ICommentDto): Promise<ITweet> => {
    try {
      const isExistTweet = await this.checkTweetExistence(target_tweet_id);
      if (isExistTweet) {
        const newTweet = await TweetModel.create(tweet);
        Debugger.log('새 답글 트윗', newTweet);
        await TweetModel.updateOne(
          { tweet_id: target_tweet_id },
          { $push: { comments: tweet.tweet_id } }
        );
        return newTweet;
      } else {
        throw createError(404, '존재하지 않는 트윗에는 답글을 달 수 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  };
  deleteCommentTweet = async (
    orig_tweet_id: number,
    comment_tweet_id: number
  ): Promise<void> => {
    try {
      const response = await TweetModel.findOneAndUpdate(
        { tweet_id: orig_tweet_id },
        { $pull: { comments: comment_tweet_id } }
      );
      if (response) {
        await this.deleteTweet(comment_tweet_id);
        return;
      } else {
        throw createError(404, '답글의 대상 트윗이 존재하지 않습니다.');
      }
    } catch (error) {
      throw error;
    }
  };
}
