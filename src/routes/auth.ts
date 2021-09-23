import express from 'express';
import AuthController from '../api/auth/auth.controller';
import AuthService from '../api/auth/auth.service';

const controller = new AuthController(new AuthService());
const router = express.Router();

router.post('/join', controller.join);

export default router;
