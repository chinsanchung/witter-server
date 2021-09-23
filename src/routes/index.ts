import express from 'express';
import authRouter from './auth';
import tweetRouter from './tweet';

const routesList: { path: string; router: express.Router }[] = [
  { path: '/auth', router: authRouter },
  { path: '/tweet', router: tweetRouter },
];

export default routesList;
