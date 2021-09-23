import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { IAuthService, JoinDto } from './auth.interface';
import Debugger from '../../utils/debugger';
import { IUser } from '../../models/User';

export default class AuthController {
  private saltRound: number = 7;
  constructor(private authService: IAuthService) {}
  private convertPassword = (password: string): string => {
    const bcryptedPassword = bcrypt.hashSync(password, this.saltRound);
    return bcryptedPassword;
  };

  join = async (req: Request, res: Response) => {
    const { email, password, name, user_id, country }: JoinDto = req.body;
    // Debugger.log(req.body);
    try {
      const newPassword: string = this.convertPassword(password);
      await this.authService.join({
        email,
        password: newPassword,
        name,
        user_id,
        country,
        join_date: new Date(),
      });
      return res.send('success');
    } catch (error) {
      Debugger.error(error);
      return res.status(500).send('회원 가입에 에러가 발생했습니다.');
    }
  };
  login = (req: Request, res: Response, next: NextFunction) => {
    Debugger.log('로그인 시작');
    passport.authenticate(
      'local',
      (authError, user: IUser, info: { message: string }) => {
        if (authError) {
          Debugger.error('로그인 인증 에러', authError);
          return res.status(403).send('로그인 인증에 에러가 발생했습니다.');
        }
        if (!user) {
          Debugger.log('info: ', info);
          return res.status(403).send(info.message);
        }
        return req.login(user, (loginError) => {
          if (loginError) {
            Debugger.error('로그인 에러', loginError);
            return next(loginError);
          } else {
            Debugger.log('로그인 성공');
            return res.send('login success');
          }
        });
      }
    )(req, res, next);
  };
  logout = (req: Request, res: Response) => {
    req.logout();
    // req.session.destroy();
    Debugger.log('로그아웃');
    return res.send('logout success');
  };
}
