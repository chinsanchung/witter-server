import { UserModel, IUser } from '../../models/User';
import { IUserService, IProfileDto } from './user.interface';

export default class UserService implements IUserService {
  getFollowerList(user_id: string): Promise<IUser[]> {
    throw new Error('Method not implemented.');
  }
  getFollowingList(user_id: string): Promise<IUser[]> {
    throw new Error('Method not implemented.');
  }
  checkEmailDuplicate(email: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  checkIdDuplicate(user_id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  changeProfile({ name, description }: IProfileDto): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
