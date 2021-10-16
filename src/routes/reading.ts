import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import ReadingController from '../api/reading/reading.controller';
import ReadingService from '../api/reading/reading.service';

const controller = new ReadingController(new ReadingService());
const router = express.Router();

router.get('/', isLoggedIn, controller.getHomeTimeLine); // 메인 타임라인 출력하기
router.get('/:user_id', controller.getUserTimeLine); // 특정 사용자의 타임라인 출력하기

export default router;
