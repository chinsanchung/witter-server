import createError from '../../utils/createError';
import { UserModel, IUser } from '../../models/User';
import { IUserService, IProfileDto } from './user.interface';
import Debugger from 'src/utils/debugger';

export default class UserService implements IUserService {
  getFollowerList = async (user_id: string): Promise<IUser[]> => {
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
  };
  getFollowingList = async (user_id: string): Promise<IUser[]> => {
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
  };
  checkEmailDuplicate = async (email: string): Promise<boolean> => {
    const response = await UserModel.findOne({ email }).lean();
    if (response) {
      Debugger.log('중복 이메일');
      return true; // 중복
    } else {
      return false;
    }
  };
  checkIdDuplicate = async (user_id: string): Promise<boolean> => {
    const response = await UserModel.findOne({ user_id }).lean();
    if (response) {
      Debugger.log('중복 이메일');
      return true; // 중복
    } else {
      return false;
    }
  };
  changeProfile = async ({
    user_id,
    name,
    description,
  }: IProfileDto): Promise<void> => {
    try {
      const response = await UserModel.findOneAndUpdate(
        {
          user_id,
        },
        {
          $set: {
            name,
            description,
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
  };
}
