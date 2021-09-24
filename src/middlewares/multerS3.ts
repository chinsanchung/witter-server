import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import path from 'path';
import getRandomString from '../utils/getRandomString';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET = process.env.AWS_SECRET;
const BUCKET = 'twitterclonetest';
const REGION = 'ap-northeast-2';

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET,
  region: REGION,
});

const uploadSingleFile = multer({
  storage: multerS3({
    s3,
    acl: 'public-read-write',
    bucket: BUCKET,
    key: (req: Request, file, cb) => {
      const randomFileName = getRandomString();
      cb(null, randomFileName);
    },
  }),
}).single('file');

const uploadFiles = multer({
  storage: multerS3({
    s3,
    acl: 'public-read-write',
    bucket: BUCKET,
    key: (req: Request, file, cb) => {
      const randomString = getRandomString(10);
      const dateTime = new Date().getTime();
      cb(null, `${randomString}_${dateTime}`);
    },
  }),
}).array('files', 4);

const deleteS3File = (
  key: string,
  callback?: (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => void
) => s3.deleteObject({ Bucket: BUCKET, Key: key }, callback);

const S3 = {
  uploadSingleFile,
  uploadFiles,
  deleteS3File,
};

export default S3;
