import createError from '../../utils/createError';
import { TweetModel, ITweet } from '../../models/Tweet';
import Debugger from '../../utils/debugger';
import { ICreateDto, ITweetActionDto, ITweetService } from './tweet.interface';

export default class TweetService implements ITweetService {
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
      const response: { modifiedCount: number } = await TweetModel.updateOne(
        { tweet_id },
        { $set: { is_active: false } }
      );
      Debugger.log('삭제 결과', response.modifiedCount);
      if (response.modifiedCount == 1) {
        return;
      } else {
        throw createError(404, '존재하지 않는 트윗입니다.');
      }
    } catch (error) {
      Debugger.error('트윗 삭제 에러: ', error);
      throw createError(500, '트윗 삭제 과정에서 에러가 발생했습니다.');
    }
  };
  doTweetAction = async ({
    tweet_id,
    user_id,
    action_type,
    action,
  }: ITweetActionDto): Promise<void> => {
    try {
      let modifiedCount: number = 0;
      if (action === 'do') {
        Debugger.log(action_type, ' 시작');
        const response: { modifiedCount: number } = await TweetModel.updateOne(
          { tweet_id },
          { $push: { [`${action_type}`]: user_id } }
        );
        modifiedCount = response.modifiedCount;
      } else {
        Debugger.log(action_type, ' 취소');
        const response: { modifiedCount: number } = await TweetModel.updateOne(
          { tweet_id },
          { $pull: { [`${action_type}`]: user_id } }
        );
        modifiedCount = response.modifiedCount;
      }
      Debugger.log(action_type, ' ', action, ' 결과: ', modifiedCount);
      if (modifiedCount === 1) {
        return;
      } else {
        throw createError(
          404,
          '존재하지 않는 트윗, 또는 이미 취소한 것을 다시 취소하면 발생하는 에러입니다.'
        );
      }
    } catch (error) {
      throw error; // createError 로 나온 것.
    }
  };
}
