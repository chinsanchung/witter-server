import { ITweet, TweetModel } from '../../models/Tweet';
import { ITimeLine, TimeLineModel } from '../../models/TimeLine';
import createError from '../../utils/createError';
import Debugger from '../../utils/debugger';
import { IReadingService, IGetTweetsResponse } from './reading.interface';

export default class ReadingService implements IReadingService {
  private getUserInfoQuery = (writer_id: string) => {
    return {
      $lookup: {
        from: 'users',
        let: { writer_id: `$${writer_id}` },
        pipeline: [
          { $match: { $expr: { $eq: ['$user_id', '$$writer_id'] } } },
          {
            $project: {
              _id: 0,
              name: '$name',
              user_id: '$user_id',
              photo: '$photo',
              description: '$description',
              follower: { $size: '$follower' },
              following: { $size: '$following' },
            },
          },
        ],
        as: 'user',
      },
    };
  };
  private defaultSettingQuery = [
    {
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
    },
  ];
  private getTweetsFromTimeLineQuery = {
    $lookup: {
      from: 'tweets',
      let: { tweet_id: '$tweet_list.tweet_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$tweet_id', '$$tweet_id'] } } },
        {
          $project: {
            _id: 0,
            tweet_id: '$tweet_id',
            user_id: '$user_id',
            image: '$image',
            video: '$video',
            contents: '$contents',
            create_date: '$create_date',
            retweet: '$retweet',
            like: '$like',
            comments: '$comments',
            is_active: '$is_active',
          },
        },
        ...this.defaultSettingQuery,
      ],
      as: 'tweet',
    },
  };

  private projectTweetQuery = {
    _id: 0,
    user_id: '$user_id',
    writer_id: '$tweet.user_id',
    tweet_id: '$tweet.tweet_id',
    video: '$tweet.video',
    image: '$tweet.image',
    contents: '$tweet.contents',
    create_date: '$tweet.create_date',
    retweet: '$tweet.retweet',
    retweet_count: '$tweet.retweet_count',
    like: '$tweet.like',
    like_count: '$tweet.like_count',
    comments_count: '$tweet.comments_count',
    is_retweet: '$tweet_list.is_retweet',
    register_date: '$tweet_list.register_date',
  };
  private timeLineLimit: number = 10;

  getTweets = async (tweet_id: number): Promise<IGetTweetsResponse> => {
    // 트윗 하나를 클릭했을 때 해당 트윗과 답글들을 출력합니다.
    try {
      const originalTweet = await TweetModel.aggregate([
        { $match: { tweet_id } },
        this.getUserInfoQuery('user_id'),
        ...this.defaultSettingQuery,
        { $unwind: '$user' },
      ]);
      Debugger.log('오리지널', originalTweet);
      if (originalTweet.length > 0 && originalTweet[0].is_active) {
        const comments = await TweetModel.aggregate([
          { $match: { tweet_id: { $in: originalTweet[0].comments } } },
          this.getUserInfoQuery('user_id'),
          ...this.defaultSettingQuery,
          { $unwind: '$user' },
          { $sort: { create_date: 1 } },
        ]);
        Debugger.log('댓글', comments);
        return {
          origin: originalTweet[0],
          comments,
        };
      } else {
        throw createError(404, '삭제되었거나 존재하지 않는 트윗입니다.');
      }
    } catch (error) {
      throw error;
      // throw createError(500, '트윗을 불러오지 못했습니다.');
    }
  };
  getUserTimeLine = async (user_id: string): Promise<ITweet[]> => {
    try {
      const response = await TimeLineModel.aggregate([
        { $match: { user_id } },
        { $unwind: '$tweet_list' },
        this.getTweetsFromTimeLineQuery,
        { $unwind: '$tweet' },
        {
          $project: {
            ...this.projectTweetQuery,
          },
        },
        this.getUserInfoQuery('writer_id'),
        { $unwind: '$user' },
        { $sort: { register_date: -1 } },
      ]);
      if (response.length > 0) {
        return response;
      } else {
        throw createError(404, '타임라인이 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  };
  getUserLikeTimeLine = async (user_id: string): Promise<ITweet[]> => {
    try {
      const response = await TimeLineModel.aggregate([
        { $match: { user_id } },
        { $unwind: '$like_list' },
        this.getTweetsFromTimeLineQuery,
        { $unwind: '$tweet' },
        {
          $project: {
            ...this.projectTweetQuery,
          },
        },
        this.getUserInfoQuery('writer_id'),
        { $unwind: '$user' },
        { $sort: { register_date: -1 } },
      ]);
      if (response.length > 0) {
        return response;
      } else {
        throw createError(404, '타임라인이 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  };
  getHomeTimeLine = async ({
    user_id,
    following,
  }: {
    user_id: string;
    following: string[];
  }): Promise<ITweet[]> => {
    try {
      const response = await TimeLineModel.aggregate([
        { $match: { user_id: { $in: [...following, user_id] } } },
        { $unwind: '$tweet_list' },
        this.getTweetsFromTimeLineQuery,
        { $unwind: '$tweet' },
        {
          $project: {
            ...this.projectTweetQuery,
          },
        },
        this.getUserInfoQuery('writer_id'),
        { $unwind: '$user' },
        {
          $group: {
            _id: '$tweet_id',
            orig: { $push: '$$ROOT' },
          },
        },
        { $project: { data: { $first: '$orig' } } },
        {
          $project: {
            user_id: '$data.user_id',
            writer_id: '$data.writer_id',
            tweet_id: '$data.tweet_id',
            video: '$data.video',
            image: '$data.image',
            contents: '$data.contents',
            create_date: '$data.create_date',
            retweet: '$data.retweet',
            retweet_count: '$data.retweet_count',
            like: '$data.like',
            like_count: '$data.like_count',
            comments_count: '$data.comments_count',
            is_retweet: '$data.is_retweet',
            register_date: '$data.register_date',
            user: '$data.user',
          },
        },
        { $sort: { register_date: -1 } },
      ]);

      if (response.length > 0) {
        return response;
      } else {
        throw createError(404, '타임라인에 트윗이 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  };
}
