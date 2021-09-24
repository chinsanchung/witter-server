import { Schema, model } from 'mongoose';
import { mediaSchema, IMedia } from './mediaSchema';

interface ITweet {
  tweet_id: number;
  writer_id: string; // 작성자의 id
  image: IMedia[];
  video: IMedia;
  contents: string; // 문장
  create_date: Date;
  retweet: string[]; // 리트윗한 사용자의 id 목록
  like: string[]; // 마음에 들어요를 누른 사용자의 id 목록
  comments: number[]; // 해당 트윗에 답글 트윗을 단 tweet_id 목록
  is_active: boolean; // 삭제를 하지 않았는지 여부. 삭제 시 false
}

const schema = new Schema<ITweet>({
  tweet_id: { type: Number, required: true },
  writer_id: { type: String, ref: 'users', required: true },
  image: { type: [mediaSchema], default: null },
  video: { type: mediaSchema, default: null },
  contents: { type: String, default: '' },
  create_date: { type: Date, required: true },
  retweet: { type: [String], ref: 'users', default: [] },
  like: { type: [String], ref: 'users', default: [] },
  comments: { type: [Number], ref: 'users', default: [] },
  is_active: { type: Boolean, default: true },
});

const TweetModel = model<ITweet>('tweets', schema);

export { TweetModel, ITweet };
