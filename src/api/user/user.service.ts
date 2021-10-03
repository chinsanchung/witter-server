import createError from '../../utils/createError';
import { UserModel, IUser } from '../../models/User';
import { IUserService, IProfileDto, IFollowDto } from './user.interface';
import Debugger from '../../utils/debugger';

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

  changeProfile = async ({
    user_id,
    name,
    description,
    profile_color,
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
  };

  followUser = async ({
    user_id,
    target_user_id,
  }: IFollowDto): Promise<void> => {
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
  };
  unFollowUser = async ({
    user_id,
    target_user_id,
  }: IFollowDto): Promise<void> => {
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
  };
}
