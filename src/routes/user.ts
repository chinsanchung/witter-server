import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import UserController from '../api/user/user.controller';
import UserService from '../api/user/user.service';

const controller = new UserController(new UserService());
const router = express.Router();

router.get('/follower-list', controller.getFollowerList);
router.get('/following-list', controller.getFollowingList);
router.patch('/change-profile', isLoggedIn, controller.changeProfile);

router.patch('/follow-user', isLoggedIn, controller.followUser);
router.patch('/unfollow-user', isLoggedIn, controller.unFollowUser);

export default router;
