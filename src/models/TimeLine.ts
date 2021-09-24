import { Schema, model } from 'mongoose';

interface ITimeLine {
  user_id: string;
  // 사용자 한 명이 트윗을 작성하거나 리트윗한 트윗의 아이디를 저장합니다.
  tweet_list: number[];
  // 사용자가 마음에 들어요한 트윗들을 저장합니다.
  like_list: number[];
}

const schema = new Schema<ITimeLine>({
  user_id: { type: String, required: true },
  tweet_list: { type: [Number], default: [] },
  like_list: { type: [Number], default: [] },
});

const TimeLineModel = model<ITimeLine>('timelines', schema);

export { TimeLineModel, ITimeLine };
