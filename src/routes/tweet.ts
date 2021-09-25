import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import TweetController from '../api/tweet/tweet.controller';
import TweetService from '../api/tweet/tweet.service';

const controller = new TweetController(new TweetService());
const router = express.Router();

router.post('/create', isLoggedIn, controller.createTweet);
router.post('/add-comment', isLoggedIn, controller.addCommentTweet);

router.patch('/delete', isLoggedIn, controller.deleteTweet);

router.patch('/do-retweet', isLoggedIn, controller.doRetweet);
router.patch('/undo-retweet', isLoggedIn, controller.unDoRetweet);

router.patch('/do-like', isLoggedIn, controller.doLike);
router.patch('/undo-retweet', isLoggedIn, controller.unDoLike);

router.patch('/delete-comment', isLoggedIn, controller.deleteCommentTweet);

export default router;
