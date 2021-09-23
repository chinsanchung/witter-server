import { Schema } from 'mongoose';

export interface IMedia {
  key: string; // S3 객체의 키
  url: string; // S3 객체의 주소
}

export const mediaSchema = new Schema<IMedia>(
  {
    key: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);
