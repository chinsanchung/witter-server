import passport from 'passport';
import passportLocal from 'passport-local';
import bcrypt from 'bcrypt';
import { UserModel, IUser } from '../models/User';
import Debugger from '../utils/debugger';

const LocalStrategy = passportLocal.Strategy;

const setDefaultConfig = (): void => {
  passport.serializeUser((user: IUser, done) => {
    done(null, user.user_id);
  });
  passport.deserializeUser((user_id: IUser['user_id'], done) => {
    UserModel.findOne({ user_id })
      .then((user: IUser) => done(null, user))
      .catch((err) => done(err));
  });
};

const setLocalStrategy = (): void => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email: string, password: string, done) => {
        try {
          const user: IUser = await UserModel.findOne({ email });
          // Debugger.log('로컬 - ', email, password);
          // Debugger.log('로컬 = 유저 ', user);
          if (user) {
            const isCorrectPassword = await bcrypt.compare(
              password,
              user.password
            );
            if (isCorrectPassword) done(null, user);
            else {
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
          } else {
            done(null, false, {
              message: '회원 가입을 하지 않은 이메일입니다.',
            });
          }
        } catch (error) {
          Debugger.error(error);
          done(error);
        }
      }
    )
  );
};

export default (): void => {
  setDefaultConfig();
  setLocalStrategy();
};
