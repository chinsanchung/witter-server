import createError from '../../utils/createError';
import { TweetModel, ITweet } from '../../models/Tweet';
import { TimeLineModel } from '../../models/TimeLine';
import Debugger from '../../utils/debugger';
import {
  ICreateDto,
  ITweetActionDto,
  ICommentDto,
  IGetTweetsResponseDto,
  IDeleteCommentDto,
  ITweetService,
} from './tweet.interface';

interface ITweetWithTimeLineParameter {
  user_id: string;
  tweet_id: number;
  is_retweet?: boolean;
  target_list: 'tweet_list' | 'like_list';
}

export default class TweetService implements ITweetService {
  constructor() {
    this.checkTweetExistence = this.checkTweetExistence.bind(this);
    this.addTweetToTimeLine = this.addTweetToTimeLine.bind(this);
    this.deleteTweetFromTimeLine = this.deleteTweetFromTimeLine.bind(this);

    this.getTweet = this.getTweet.bind(this);
    this.createTweet = this.createTweet.bind(this);
    this.deleteTweet = this.deleteTweet.bind(this);
    this.doRetweet = this.doRetweet.bind(this);
    this.unDoRetweet = this.unDoRetweet.bind(this);
    this.doLike = this.doLike.bind(this);
    this.unDoLike = this.unDoLike.bind(this);
    this.addComment = this.addComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }
  // 트윗을 읽어오는데 활용합니다.
  private getUserInfoQuery = {
    $lookup: {
      from: 'users',
      let: { writer_id: '$user_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$user_id', '$$writer_id'] } } },
        {
          $project: {
            _id: 0,
            name: '$name',
            user_id: '$user_id',
            profile_color: '$profile_color',
            description: '$description',
            follower: '$follower',
            following: '$following',
            follower_count: { $size: '$follower' },
            following_count: { $size: '$following' },
          },
        },
      ],
      as: 'user',
    },
  };
  private setDateAndCountQuery = {
    $set: {
      create_date: {
        $dateToString: {
          format: '%H:%M · %Y년 %m월 %d일',
          timezone: '+09:00',
          date: '$create_date',
        },
      },
      retweet_count: { $size: '$retweet' },
      like_count: { $size: '$like' },
      comments_count: { $size: '$comments' },
    },
  };
  // 트윗을 작성하는데 활용합니다.
  private async checkTweetExistence(tweet_id: number): Promise<boolean> {
    const response = await TweetModel.findOne({ tweet_id })
      .select('tweet_id')
      .lean();
    if (response) {
      return true;
    } else return false;
  }
  private async addTweetToTimeLine({
    user_id,
    tweet_id,
    is_retweet,
    target_list,
  }: ITweetWithTimeLineParameter): Promise<void> {
    try {
      await TimeLineModel.updateOne(
        { user_id },
        {
          $push: {
            [`${target_list}`]: {
              tweet_id,
              is_retweet,
              register_date: new Date(),
            },
          },
        },
        { $upsert: true }
      );
      return;
    } catch (error) {
      throw createError(500, '타임라인에 트윗을 등록하는 데 실패했습니다.');
    }
  }
  private async deleteTweetFromTimeLine({
    user_id,
    tweet_id,
    target_list,
  }: ITweetWithTimeLineParameter): Promise<void> {
    try {
      await TimeLineModel.updateOne(
        { user_id },
        { $pull: { [`${target_list}`]: { tweet_id } } },
        { $upsert: true }
      );
      return;
    } catch (error) {
      throw createError(500, '타임라인에서 트윗을 삭제하는 데 실패했습니다.');
    }
  }

  async getTweet(tweet_id: number): Promise<IGetTweetsResponseDto> {
    // 트윗 하나를 클릭했을 때 해당 트윗과 답글들을 출력합니다.
    try {
      const originalTweet = await TweetModel.aggregate([
        { $match: { tweet_id } },
        this.getUserInfoQuery,
        this.setDateAndCountQuery,
        { $unwind: '$user' },
      ]);
      // Debugger.log('오리지널', originalTweet);
      if (originalTweet.length > 0 && originalTweet[0].is_active) {
        const comments = await TweetModel.aggregate([
          { $match: { tweet_id: { $in: originalTweet[0].comments } } },
          this.getUserInfoQuery,
          this.setDateAndCountQuery,
          { $unwind: '$user' },
          { $sort: { create_date: 1 } },
        ]);
        return {
          origin: originalTweet[0],
          comments,
        };
      } else {
        throw createError(404, '존재하지 않는 트윗입니다.');
      }
    } catch (error) {
      throw error;
    }
  }
  async createTweet(tweet: ICreateDto): Promise<ITweet> {
    try {
      // Debugger.log('서비스에서 트윗 생성');
      const newTweet = await TweetModel.create(tweet);
      Debugger.log('새 트윗', newTweet);
      await this.addTweetToTimeLine({
        user_id: newTweet.user_id,
        tweet_id: newTweet.tweet_id,
        is_retweet: false,
        target_list: 'tweet_list',
      });
      return newTweet;
    } catch (error) {
      Debugger.error('트윗 생성 에러: ', error);
      throw createError(500, '트윗 생성 과정에서 에러가 발생했습니다.');
    }
  }
  async deleteTweet(tweet_id: number): Promise<void> {
    try {
      const response = await TweetModel.findOneAndUpdate(
        { tweet_id },
        { $set: { is_active: false } }
      );
      Debugger.log('삭제 결과', response);
      if (response) {
        // TODO: 이미지나 동영상 삭제 기능 추가하기

        await this.deleteTweetFromTimeLine({
          user_id: response.user_id,
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
  }

  async doRetweet({ tweet_id, user_id }: ITweetActionDto): Promise<void> {
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
          is_retweet: true,
          target_list: 'tweet_list',
        });
        return;
      }
    } catch (error) {
      throw error;
    }
  }
  async unDoRetweet({ tweet_id, user_id }: ITweetActionDto): Promise<void> {
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
  }

  async doLike({ tweet_id, user_id }: ITweetActionDto): Promise<void> {
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
          is_retweet: false,
          target_list: 'like_list',
        });
        return;
      }
    } catch (error) {
      throw error;
    }
  }
  async unDoLike({ tweet_id, user_id }: ITweetActionDto): Promise<void> {
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
  }

  async addComment({ tweet, target_tweet_id }: ICommentDto): Promise<ITweet> {
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
          user_id: tweet.user_id,
          tweet_id: tweet.tweet_id,
          is_retweet: false,
          target_list: 'tweet_list',
        });
        return newTweet;
      } else {
        throw createError(404, '존재하지 않는 트윗에는 답글을 달 수 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  }
  async deleteComment({
    orig_tweet_id,
    comment_tweet_id,
    comment_writer_id,
  }: IDeleteCommentDto): Promise<void> {
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
  }
}
