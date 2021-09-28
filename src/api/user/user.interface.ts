import { IUser } from '../../models/User';

export interface IProfileDto {
  name: string;
  description: string;
}

export interface IUserService {
  getFollowerList(user_id: string): Promise<IUser[]>;
  getFollowingList(user_id: string): Promise<IUser[]>;
  checkEmailDuplicate(email: string): Promise<boolean>;
  checkIdDuplicate(user_id: string): Promise<boolean>;
  changeProfile({ name, description }: IProfileDto): Promise<void>;
}
