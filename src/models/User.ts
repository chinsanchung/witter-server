import { Schema, model, Document } from 'mongoose';
import { mediaSchema, IMedia } from './mediaSchema';

interface IUser {
  email: string; // 로그인 계정
  password: string;
  name: string; // 닉네임
  user_id: string; // @ 로 시작하는 아이디
  join_date: Date;
  country: string;
  follower: string[];
  following: string[];
  header: IMedia | null;
  photo: IMedia | null;
  description: string;
  lock_status: 'all' | 'private';
}

const schema = new Schema<IUser>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  user_id: { type: String, required: true },
  join_date: { type: Date, required: true },
  country: { type: String, required: true },
  follower: { type: [String], default: [] },
  following: { type: [String], default: [] },
  header: { type: mediaSchema, default: null },
  photo: { type: mediaSchema, default: null },
  description: { type: String, default: '' },
  lock_status: { type: String, enum: ['all', 'private'], default: 'all' },
});

const UserModel = model<IUser>('users', schema);

export { UserModel, IUser };
