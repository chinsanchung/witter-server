import { IUser } from '../../models/User';

export interface JoinDto {
  readonly email: string; // 로그인 계정
  readonly password: string;
  readonly name: string; // 닉네임
  readonly user_id: string; // @ 로 시작하는 아이디
  readonly join_date: Date;
  readonly profile_color: string;
}

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
  join(user: JoinDto): Promise<IUser>;
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
