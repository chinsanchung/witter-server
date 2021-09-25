import { Schema, model } from 'mongoose';

interface ISingleTimeLine {
  tweet_id: number;
  is_retweet: boolean;
  register_date: Date; //  트윗 작성일 대신 타임라인 정렬에 사용합니다.
}

interface ITimeLine {
  user_id: string;
  // 사용자 한 명이 트윗을 작성하거나 리트윗한 내역
  tweet_list: ISingleTimeLine[];
  // 사용자가 마음에 들어요한 트윗의 내역
  like_list: ISingleTimeLine[];
}

const singleTimeLineSchema = new Schema<ISingleTimeLine>(
  {
    tweet_id: Number,
    is_retweet: Boolean,
    register_date: Date,
  },
  { _id: false }
);

const schema = new Schema<ITimeLine>({
  user_id: { type: String, required: true },
  tweet_list: { type: [singleTimeLineSchema], default: [] },
  like_list: { type: [singleTimeLineSchema], default: [] },
});

const TimeLineModel = model<ITimeLine>('timelines', schema);

export { TimeLineModel, ITimeLine, ISingleTimeLine };
