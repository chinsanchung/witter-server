import { IUser } from '../../models/User';

export interface IProfileDto {
  user_id: string;
  name: string;
  description: string;
  profile_color: string;
}

export interface IFollowDto {
  user_id: string;
  target_user_id: string;
}

export interface IUserService {
  getFollowerList(user_id: string): Promise<IUser[]>;
  getFollowingList(user_id: string): Promise<IUser[]>;
  changeProfile({
    name,
    description,
    profile_color,
  }: IProfileDto): Promise<void>;
  followUser({ user_id, target_user_id }: IFollowDto): Promise<void>;
  unFollowUser({ user_id, target_user_id }: IFollowDto): Promise<void>;
}
