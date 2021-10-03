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
  changeProfile = async (req: Request, res: Response) => {
    try {
      const { name, description, profile_color } = req.body;
      await this.userService.changeProfile({
        // @ts-ignore
        user_id: req.user?.user_id,
        name,
        description,
        profile_color,
      });
      return res.send('success');
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  };

  followUser = async (req: Request, res: Response) => {
    try {
      const { target_user_id } = req.body;
      await this.userService.followUser({
        // @ts-ignore
        user_id: req.user?.user_id,
        target_user_id,
      });
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  };
  unFollowUser = async (req: Request, res: Response) => {
    try {
      const { target_user_id } = req.body;
      await this.userService.unFollowUser({
        // @ts-ignore
        user_id: req.user?.user_id,
        target_user_id,
      });
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  };
}
