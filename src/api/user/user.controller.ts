import { Request, Response } from 'express';
import { IProfileDto } from './user.interface';
import Debugger from '../../utils/debugger';
import { IUserService } from './user.interface';

export default class UserController {
  constructor(private userService: IUserService) {}

  getFollowerList = async (req: Request, res: Response) => {
    try {
      const response = await this.userService.getFollowerList(
        req.params.user_id
      );
      return res.json(response);
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  };
  getFollowingList = async (req: Request, res: Response) => {
    try {
      const response = await this.userService.getFollowingList(
        req.params.user_id
      );
      return res.json(response);
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  };
  checkEmailDuplicate = async (req: Request, res: Response) => {
    const response = await this.userService.checkEmailDuplicate(
      req.params.email
    );
    return res.send(response);
  };
  checkIdDuplicate = async (req: Request, res: Response) => {
    const response = await this.userService.checkIdDuplicate(req.params.userid);
    return res.send(response);
  };
  changeProfile = async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      await this.userService.changeProfile({
        // @ts-ignore
        user_id: req.user?.user_id,
        name,
        description,
      });
      return res.send('success');
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  };
}
