import express from 'express';
import { isLoggedIn } from '../middlewares/authority';
import AuthController from '../api/auth/auth.controller';
import AuthService from '../api/auth/auth.service';

const controller = new AuthController(new AuthService());
const router = express.Router();

router.get('/logout', isLoggedIn, controller.logout);
router.post('/join', controller.join);
router.post('/login', controller.login);

export default router;
