import express from 'express';
import authRouter from './auth';
import tweetRouter from './tweet';
import readingRouter from './reading';
import userRouter from './user';

const router = express.Router();
router.use('/auth', authRouter);
router.use('/tweets', tweetRouter);
router.use('/timelines', readingRouter);
router.use('/users', userRouter);

export default router;
