import { Request, Response } from 'express';
import { IProfileDto } from './user.interface';
import Debugger from '../../utils/debugger';
import { IUserService } from './user.interface';

export default class UserController {
  constructor(private userService: IUserService) {}

  getFollowerList = async (req: Request, res: Response) => {};
  getFollowingList = async (req: Request, res: Response) => {};
  checkEmailDuplicate = async (req: Request, res: Response) => {};
  checkIdDuplicate = async (req: Request, res: Response) => {};
  changeProfile = async (req: Request, res: Response) => {};
}
