import createError from 'http-errors';
import { UserModel, IUser } from '../../models/User';
import { TimeLineModel } from '../../models/TimeLine';
import Debugger from '../../utils/debugger';
import { JoinDto, IAuthService } from './auth.interface';

export default class AuthService implements IAuthService {
  constructor() {
    this.checkEmailDuplicate = this.checkEmailDuplicate.bind(this);
    this.checkIdDuplicate = this.checkIdDuplicate.bind(this);

    this.join = this.join.bind(this);
  }
  private async checkEmailDuplicate(email: string): Promise<boolean> {
    const response = await UserModel.findOne({ email }).lean();
    if (response) {
      Debugger.log('중복 이메일');
      return true; // 중복
    } else {
      return false;
    }
  }
  private async checkIdDuplicate(user_id: string): Promise<boolean> {
    const response = await UserModel.findOne({ user_id }).lean();
    if (response) {
      Debugger.log('중복 이메일');
      return true; // 중복
    } else {
      return false;
    }
  }
  // 아이디, 이메일 중복 확인 함수 넣기.
  async join(user: JoinDto): Promise<IUser> {
    try {
      const isDuplicateEmail = await this.checkEmailDuplicate(user.email);
      const isDuplicateId = await this.checkIdDuplicate(user.user_id);
      if (isDuplicateEmail && isDuplicateId) {
        const message: string = `이미 존재하는 ${
          isDuplicateId ? '이메일' : '아이디'
        }입니다.`;
        Debugger.error(message);
        throw createError(403, message);
      } else {
        // Debugger.log('서비스에서 가입 시작');
        const newUser = await UserModel.create(user);
        // Debugger.log('새 사용자', newUser);
        // 새로운 타임라인 추가
        await TimeLineModel.create({ user_id: newUser.user_id });
        return newUser;
      }
    } catch (error) {
      throw error;
    }
  }
}
