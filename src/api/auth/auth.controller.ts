import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import Debugger from '../../utils/debugger';
import { IUser } from '../../models/User';

export default class AuthController {
  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.tokenRefresh = this.tokenRefresh.bind(this);
  }

  login(req: Request, res: Response, next: NextFunction) {
    Debugger.log('로그인 시작');
    passport.authenticate(
      'local',
      (authError, user: IUser, info: { message: string }) => {
        if (authError) {
          Debugger.error('로그인 인증 에러', authError);
          res.clearCookie('connect.sid');
          return res.status(403).send('로그인 인증에 에러가 발생했습니다.');
        }
        if (!user) {
          Debugger.log('info: ', info);
          res.clearCookie('connect.sid');
          return res.status(403).send(info.message);
        }
        return req.login(user, (loginError) => {
          if (loginError) {
            Debugger.error('로그인 에러', loginError);
            res.clearCookie('connect.sid');
            return next(loginError);
          } else {
            Debugger.log('로그인 성공');
            return res.json(user);
          }
        });
      }
    )(req, res, next);
  }
  logout(req: Request, res: Response) {
    req.logout();
    req.session.destroy(() => {
      Debugger.log('로그아웃');
      res.clearCookie('connect.sid');
      return res.send('logout success');
    });
  }
  tokenRefresh(req: Request, res: Response) {
    Debugger.log('토큰 로그인 갱신하기');
    return res.json(req.user);
  }
}
