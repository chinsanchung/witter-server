import createError from 'http-errors';
import { UserModel, IUser } from '../../models/User';
import Debugger from '../../utils/debugger';
import { JoinDto, IAuthService } from './auth.interface';

export default class AuthService implements IAuthService {
  join = async (user: JoinDto): Promise<IUser> => {
    try {
      // Debugger.log('서비스에서 가입 시작');
      const newUser = await UserModel.create(user);
      // Debugger.log('새 사용자', newUser);
      return newUser;
    } catch (error) {
      Debugger.error(error);
      throw createError(error.status, error.message);
    }
  };
}
