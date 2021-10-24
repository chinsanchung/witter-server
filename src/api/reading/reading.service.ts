import { ITweet } from '../../models/Tweet';
import { TimeLineModel } from '../../models/TimeLine';
import { UserModel } from '../../models/User';
import createError from '../../utils/createError';
import {
  IReadingService,
  IGetUserTimeLineDto,
  IGetTimeLineDto,
} from './reading.interface';

export default class ReadingService implements IReadingService {
  constructor() {
    this.getUserInfoQuery = this.getUserInfoQuery.bind(this);

    this.getUserTimeLine = this.getUserTimeLine.bind(this);
    this.getUserLikeTimeLine = this.getUserLikeTimeLine.bind(this);
    this.getHomeTimeLine = this.getHomeTimeLine.bind(this);
  }

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
  private projectListQuery = {
    $project: {
      user_id: 1,
      tweet_id: '$tweet_list.tweet_id',
      is_retweet: '$tweet_list.is_retweet',
      register_date: '$tweet_list.register_date',
    },
  };
  private lookupTweetQuery = {
    $lookup: {
      from: 'tweets',
      let: { tweet_id: '$tweet_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$tweet_id', '$$tweet_id'] } } },
        {
          $project: {
            _id: 0,
            user_id: '$user_id',
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
    $project: {
      _id: 0,
      user_id: '$user_id',
      writer_id: '$tweet.user_id',
      tweet_id: 1,
      contents: '$tweet.contents',
      create_date: '$tweet.create_date',
      retweet: '$tweet.retweet',
      retweet_count: '$tweet.retweet_count',
      like: '$tweet.like',
      like_count: '$tweet.like_count',
      comments: '$tweet.comments',
      comments_count: '$tweet.comments_count',
      is_retweet: '$tweet_list.is_retweet',
      register_date: '$tweet_list.register_date',
    },
  };
  private removeDuplicateTweetQuery = [
    {
      $group: {
        _id: '$tweet_id',
        orig: { $push: '$$ROOT' },
      },
    },
    { $project: { data: { $first: '$orig' } } },
    {
      $project: {
        tweet_id: '$data.tweet_id',
        is_retweet: '$data.is_retweet',
        register_date: '$data.register_date',
      },
    },
  ];
  private TIMELINE_LIMIT: number = 10;
  private getUserInfoQuery(writer_id: string) {
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
  }

  async getUserTimeLine({
    user_id,
    page,
  }: IGetTimeLineDto): Promise<IGetUserTimeLineDto> {
    try {
      const response = await TimeLineModel.aggregate([
        { $match: { user_id } },
        { $unwind: '$tweet_list' },
        this.projectListQuery,
        ...this.removeDuplicateTweetQuery,
        { $sort: { register_date: -1 } },
        { $skip: page * this.TIMELINE_LIMIT },
        { $limit: this.TIMELINE_LIMIT },
        this.lookupTweetQuery,
        { $unwind: '$tweet' },
        this.projectTweetQuery,
        this.getUserInfoQuery('writer_id'),
      ]);
      const userSelectWord: string =
        'name user_id profile_color description follower following';
      const user = await UserModel.findOne({ user_id })
        .select(userSelectWord)
        .lean();

      if (response.length > 0) {
        return {
          user: {
            ...user,
            follower: user.follower,
            following: user.following,
            follower_count: user.follower.length,
            following_count: user.following.length,
          },
          timeLine: response,
        };
      } else {
        throw createError(404, '타임라인이 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  }
  async getUserLikeTimeLine(user_id: string): Promise<ITweet[]> {
    try {
      const response = await TimeLineModel.aggregate([
        { $match: { user_id } },
        { $unwind: '$like_list' },
        this.lookupTweetQuery,
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
  }
  async getHomeTimeLine({
    user_id,
    following,
    page,
  }: IGetTimeLineDto): Promise<ITweet[]> {
    try {
      const response = await TimeLineModel.aggregate([
        { $match: { user_id: { $in: [...following, user_id] } } },
        { $unwind: '$tweet_list' },
        this.projectListQuery,
        ...this.removeDuplicateTweetQuery,
        { $sort: { register_date: -1 } },
        { $skip: page * this.TIMELINE_LIMIT },
        { $limit: this.TIMELINE_LIMIT },
        this.lookupTweetQuery,
        { $unwind: '$tweet' },
        this.projectTweetQuery,
        this.getUserInfoQuery('writer_id'),
        { $unwind: '$user' },
      ]);

      if (response.length > 0) {
        return response;
      } else {
        throw createError(404, '타임라인에 트윗이 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  }
}
