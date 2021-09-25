import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import ReadingController from '../api/reading/reading.controller';
import ReadingService from '../api/reading/reading.service';

const controller = new ReadingController(new ReadingService());
const router = express.Router();

router.get('/home', controller.getHomeTimeLine);
router.get('/timeline/:userid', controller.getUserTimeLine);
router.get('/:tweetid', controller.getTweets);

export default router;
