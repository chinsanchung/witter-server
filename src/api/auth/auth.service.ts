import createError from 'http-errors';
import { UserModel, IUser } from '../../models/User';
import { TimeLineModel } from '../../models/TimeLine';
import Debugger from '../../utils/debugger';
import { JoinDto, IAuthService } from './auth.interface';

export default class AuthService implements IAuthService {
  // 아이디, 이메일 중복 확인 함수 넣기.
  join = async (user: JoinDto): Promise<IUser> => {
    try {
      // Debugger.log('서비스에서 가입 시작');
      const newUser = await UserModel.create(user);
      // Debugger.log('새 사용자', newUser);
      // 새로운 타임라인 추가
      await TimeLineModel.create({ user_id: newUser.user_id });
      return newUser;
    } catch (error) {
      Debugger.error(error);
      throw createError(error.status, error.message);
    }
  };
}
