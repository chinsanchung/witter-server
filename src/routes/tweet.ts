import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import TweetController from '../api/tweet/tweet.controller';
import TweetService from '../api/tweet/tweet.service';

const controller = new TweetController(new TweetService());
const router = express.Router();

router.get('/:tweet_id', controller.getTweet); // 트윗과 답글 조회

router.post('/', isLoggedIn, controller.createTweet); // 트윗 작성
router.post('/comment', isLoggedIn, controller.addCommentTweet); // 답글 작성
router.post('/retweet', isLoggedIn, controller.doRetweet); // 리트윗하기
router.post('/like', isLoggedIn, controller.doLike); // 마음에 들어요하기

router.delete('/', isLoggedIn, controller.deleteTweet); // 트윗 삭제
router.delete('/retweet/:tweet_id', isLoggedIn, controller.unDoRetweet); // 리트윗 취소하기
router.delete('/like/:tweet_id', isLoggedIn, controller.unDoLike); // 마음에 들어요 취소하기
router.delete(
  '/comment/:orig_tweet_id/:comment_tweet_id',
  isLoggedIn,
  controller.deleteCommentTweet
); // 답글 삭제

export default router;
