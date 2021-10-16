import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import UserController from '../api/user/user.controller';
import UserService from '../api/user/user.service';

const controller = new UserController(new UserService());
const router = express.Router();

router.get('/follower-list', controller.getFollowerList); // 팔로워 목록 출력하기
router.get('/following-list', controller.getFollowingList); // 팔로잉 목록 출력하기

router.post('/', controller.join); // 회원가입

router.patch('/', isLoggedIn, controller.changeProfile); // 사용자 프로필 설정
router.patch('/follow', isLoggedIn, controller.followUser); // 팔로우하기
router.patch('/unfollow', isLoggedIn, controller.unFollowUser); // 팔로우 취소하기

export default router;
