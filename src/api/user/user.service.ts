import createError from '../../utils/createError';
import { UserModel, IUser } from '../../models/User';
import { TimeLineModel } from '../../models/TimeLine';
import {
  JoinDto,
  IProfileDto,
  IFollowDto,
  IUserService,
} from './user.interface';
import Debugger from '../../utils/debugger';

export default class UserService implements IUserService {
  constructor() {
    this.checkEmailDuplicate = this.checkEmailDuplicate.bind(this);
    this.checkIdDuplicate = this.checkIdDuplicate.bind(this);

    this.join = this.join.bind(this);
    this.getFollowerList = this.getFollowerList.bind(this);
    this.getFollowingList = this.getFollowingList.bind(this);
    this.changeProfile = this.changeProfile.bind(this);
    this.followUser = this.followUser.bind(this);
    this.unFollowUser = this.unFollowUser.bind(this);
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
  async getFollowerList(user_id: string): Promise<IUser[]> {
    try {
      const user = await UserModel.findOne({ user_id })
        .select('follower')
        .lean();
      if (!user) {
        throw createError(404, '존재하지 않는 아이디입니다.');
      }
      Debugger.log('user: ', user);
      const response = await UserModel.aggregate([
        { $match: { $in: { user_id: user.follower } } },
      ]);
      return response;
    } catch (error) {
      throw error;
    }
  }
  async getFollowingList(user_id: string): Promise<IUser[]> {
    try {
      const user = await UserModel.findOne({ user_id })
        .select('following')
        .lean();
      if (!user) {
        throw createError(404, '존재하지 않는 아이디입니다.');
      }
      Debugger.log('user: ', user);
      const response = await UserModel.aggregate([
        { $match: { $in: { user_id: user.following } } },
      ]);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async changeProfile({
    user_id,
    name,
    description,
    profile_color,
  }: IProfileDto): Promise<void> {
    try {
      const response = await UserModel.findOneAndUpdate(
        {
          user_id,
        },
        {
          $set: {
            name,
            description,
            profile_color,
          },
        }
      );
      if (response) {
        return;
      } else {
        throw createError(404, '존재하지 않는 아이디입니다.');
      }
    } catch (error) {
      throw error;
    }
  }

  async followUser({ user_id, target_user_id }: IFollowDto): Promise<void> {
    try {
      Debugger.log('followUser 시작', user_id, ', ', target_user_id);
      // 로그인한 유저의 following 에 상대방 아이디를 추가
      const loginUserRes = await UserModel.findOneAndUpdate(
        { user_id },
        {
          $push: { following: target_user_id },
        }
      )
        .select('user_id')
        .lean();
      // 상대방의 follower 에 로그인 유저의 아이디 추가
      const targetUserRes = await UserModel.findOneAndUpdate(
        { user_id: target_user_id },
        {
          $push: { follower: user_id },
        }
      )
        .select('user_id')
        .lean();
      if (loginUserRes && targetUserRes) {
        return;
      } else {
        Debugger.log('loginUserRes: ', loginUserRes);
        Debugger.log('targetUserRes: ', targetUserRes);
        throw createError(500, '팔로우에 실패했습니다.');
      }
    } catch (error) {
      throw error;
    }
  }
  async unFollowUser({ user_id, target_user_id }: IFollowDto): Promise<void> {
    try {
      Debugger.log('unFollowUser 시작', user_id, ', ', target_user_id);
      // 로그인한 유저의 following 에 상대방 아이디를 추가
      const loginUserRes = await UserModel.findOneAndUpdate(
        { user_id },
        {
          $pull: { following: target_user_id },
        }
      )
        .select('user_id')
        .lean();
      // 상대방의 follower 에 로그인 유저의 아이디 추가
      const targetUserRes = await UserModel.findOneAndUpdate(
        { user_id: target_user_id },
        {
          $pull: { follower: user_id },
        }
      )
        .select('user_id')
        .lean();
      if (loginUserRes && targetUserRes) {
        return;
      } else {
        Debugger.log('loginUserRes: ', loginUserRes);
        Debugger.log('targetUserRes: ', targetUserRes);
        throw createError(500, '팔로우 해제에 실패했습니다.');
      }
    } catch (error) {
      throw error;
    }
  }
}
