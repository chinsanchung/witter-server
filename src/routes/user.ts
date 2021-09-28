import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import UserController from '../api/user/user.controller';
import UserService from '../api/user/user.service';

const controller = new UserController(new UserService());
const router = express.Router();

router.get('/follower-list', controller.getFollowerList);
router.get('/following-list', controller.getFollowingList);

router.get('/check-email-duplicate/:email', controller.checkEmailDuplicate);
router.get('/check-id-duplicate/:userid', controller.checkIdDuplicate);
router.patch('change-profile', isLoggedIn, controller.changeProfile);

export default router;
