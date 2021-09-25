import createError from '../../utils/createError';
import { TweetModel, ITweet } from '../../models/Tweet';
import { TimeLineModel } from '../../models/TimeLine';
import Debugger from '../../utils/debugger';
import {
  ICreateDto,
  ITweetActionDto,
  ICommentDto,
  ITweetService,
} from './tweet.interface';

interface ITweetWithTimeLineParameter {
  user_id: string;
  tweet_id: number;
  target_list: 'tweet_list' | 'like_list';
}

export default class TweetService implements ITweetService {
  private checkTweetExistence = async (tweet_id: number): Promise<boolean> => {
    const response = await TweetModel.findOne({ tweet_id })
      .select('tweet_id')
      .lean();
    if (response) {
      return true;
    } else return false;
  };
  private addTweetToTimeLine = async ({
    user_id,
    tweet_id,
    target_list,
  }: ITweetWithTimeLineParameter): Promise<void> => {
    try {
      await TimeLineModel.updateOne(
        { user_id },
        { $push: { [`${target_list}`]: tweet_id } },
        { $upsert: true }
      );
      return;
    } catch (error) {
      throw createError(500, '타임라인에 트윗을 등록하는 데 실패했습니다.');
    }
  };
  private deleteTweetFromTimeLine = async ({
    user_id,
    tweet_id,
    target_list,
  }: ITweetWithTimeLineParameter): Promise<void> => {
    try {
      await TimeLineModel.updateOne(
        { user_id },
        { $pull: { [`${target_list}`]: tweet_id } },
        { $upsert: true }
      );
      return;
    } catch (error) {
      throw createError(500, '타임라인에서 트윗을 삭제하는 데 실패했습니다.');
    }
  };

  createTweet = async (tweet: ICreateDto): Promise<ITweet> => {
    try {
      // Debugger.log('서비스에서 트윗 생성');
      const newTweet = await TweetModel.create(tweet);
      Debugger.log('새 트윗', newTweet);
      await this.addTweetToTimeLine({
        user_id: newTweet.writer_id,
        tweet_id: newTweet.tweet_id,
        target_list: 'tweet_list',
      });
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

        await this.deleteTweetFromTimeLine({
          user_id: response.writer_id,
          tweet_id,
          target_list: 'tweet_list',
        });
        return;
      } else {
        throw createError(404, '존재하지 않는 트윗입니다.');
      }
    } catch (error) {
      throw error;
    }
  };

  doRetweet = async ({ tweet_id, user_id }: ITweetActionDto): Promise<void> => {
    try {
      const isExistTweet = await this.checkTweetExistence(tweet_id);
      if (!isExistTweet) {
        throw createError(404, '존재하지 않는 트윗입니다.');
      } else {
        Debugger.log('리트윗 시작');
        await TweetModel.updateOne(
          { tweet_id },
          { $push: { retweet: user_id } }
        );
        await this.addTweetToTimeLine({
          user_id,
          tweet_id,
          target_list: 'tweet_list',
        });
        return;
      }
    } catch (error) {
      throw error;
    }
  };
  unDoRetweet = async ({
    tweet_id,
    user_id,
  }: ITweetActionDto): Promise<void> => {
    try {
      const isExistTweet = await this.checkTweetExistence(tweet_id);
      if (!isExistTweet) {
        throw createError(404, '존재하지 않는 트윗입니다.');
      } else {
        Debugger.log('리트윗 취소하기 시작');
        await TweetModel.updateOne(
          { tweet_id },
          { $pull: { retweet: user_id } }
        );
        await this.deleteTweetFromTimeLine({
          user_id,
          tweet_id,
          target_list: 'tweet_list',
        });
        return;
      }
    } catch (error) {
      throw error;
    }
  };

  doLike = async ({ tweet_id, user_id }: ITweetActionDto): Promise<void> => {
    try {
      const isExistTweet = await this.checkTweetExistence(tweet_id);
      if (!isExistTweet) {
        throw createError(404, '존재하지 않는 트윗입니다.');
      } else {
        Debugger.log('마음에 들어요 시작');
        await TweetModel.updateOne({ tweet_id }, { $push: { like: user_id } });
        await this.addTweetToTimeLine({
          user_id,
          tweet_id,
          target_list: 'like_list',
        });
        return;
      }
    } catch (error) {
      throw error;
    }
  };
  unDoLike = async ({ tweet_id, user_id }: ITweetActionDto): Promise<void> => {
    try {
      const isExistTweet = await this.checkTweetExistence(tweet_id);
      if (!isExistTweet) {
        throw createError(404, '존재하지 않는 트윗입니다.');
      } else {
        Debugger.log('마음에 들어요 취소하기 시작');
        await TweetModel.updateOne({ tweet_id }, { $pull: { like: user_id } });
        await this.deleteTweetFromTimeLine({
          user_id,
          tweet_id,
          target_list: 'like_list',
        });
        return;
      }
    } catch (error) {
      throw error;
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
        await this.addTweetToTimeLine({
          user_id: tweet.writer_id,
          tweet_id: tweet.tweet_id,
          target_list: 'tweet_list',
        });
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
    comment_tweet_id: number,
    comment_writer_id: string
  ): Promise<void> => {
    try {
      const response = await TweetModel.findOneAndUpdate(
        { tweet_id: orig_tweet_id },
        { $pull: { comments: comment_tweet_id } }
      );
      if (response) {
        await this.deleteTweet(comment_tweet_id);
        await this.deleteTweetFromTimeLine({
          user_id: comment_writer_id,
          tweet_id: comment_tweet_id,
          target_list: 'tweet_list',
        });
        return;
      } else {
        throw createError(404, '답글의 대상 트윗이 존재하지 않습니다.');
      }
    } catch (error) {
      throw error;
    }
  };
}
