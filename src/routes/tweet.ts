import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import TweetController from '../api/tweet/tweet.controller';
import TweetService from '../api/tweet/tweet.service';

const controller = new TweetController(new TweetService());
const router = express.Router();

router.post('/create', isLoggedIn, controller.createTweet);

router.patch('/delete', controller.deleteTweet);

export default router;
