import createError from '../../utils/createError';
import { TweetModel, ITweet } from '../../models/Tweet';
import Debugger from '../../utils/debugger';
import { CreateDto, ITweetService } from './tweet.interface';

export default class TweetService implements ITweetService {
  createTweet = async (tweet: CreateDto): Promise<ITweet> => {
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
      throw error;
    }
  };
}
