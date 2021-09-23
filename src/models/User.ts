import { Schema, model, Document } from 'mongoose';
import { mediaSchema, IMedia } from './mediaSchema';

interface User {
  email: string; // 로그인 계정
  password: string;
  name: string; // 닉네임
  id: string; // @ 로 시작하는 아이디
  join_date: Date;
  country: string;
  follower: string[];
  following: string[];
  header: IMedia | null;
  photo: IMedia | null;
  description: string;
}

const schema = new Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  join_date: { type: Date, required: true },
  country: { type: String, required: true },
  follower: { type: [String], default: [] },
  following: { type: [String], default: [] },
  header: { type: mediaSchema, default: null },
  photo: { type: mediaSchema, default: null },
  description: { type: String, default: '' },
});

const UserModel = model<User>('users', schema);

export { UserModel, User as IUser };
