import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import AuthController from '../api/auth/auth.controller';

const controller = new AuthController();
const router = express.Router();

router.post('/login', controller.login);
router.post('/logout', isLoggedIn, controller.logout);
router.get('/token', isLoggedIn, controller.tokenRefresh); // 새로고침시 사용자 정보 불러오기

export default router;
