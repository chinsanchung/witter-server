import express from 'express';
import authRouter from './auth';
import tweetRouter from './tweet';
import readingRouter from './reading';
import userRouter from './user';

const routesList: { path: string; router: express.Router }[] = [
  { path: '/auth', router: authRouter },
  { path: '/tweet', router: tweetRouter },
  { path: '/reading', router: readingRouter },
  { path: '/user', router: userRouter },
];

export default routesList;
