import { Request, Response } from 'express';
import { IProfileDto } from './user.interface';
import Debugger from '../../utils/debugger';
import { IUserService } from './user.interface';

export default class UserController {
  constructor(private userService: IUserService) {
    this.getFollowerList = this.getFollowerList.bind(this);
    this.getFollowingList = this.getFollowingList.bind(this);
    this.changeProfile = this.changeProfile.bind(this);
    this.followUser = this.followUser.bind(this);
    this.unFollowUser = this.unFollowUser.bind(this);
  }

  async getFollowerList(req: Request, res: Response) {
    try {
      const response = await this.userService.getFollowerList(
        req.params.user_id
      );
      return res.json(response);
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  }
  async getFollowingList(req: Request, res: Response) {
    try {
      const response = await this.userService.getFollowingList(
        req.params.user_id
      );
      return res.json(response);
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  }
  async changeProfile(req: Request, res: Response) {
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
  }

  async followUser(req: Request, res: Response) {
    try {
      const { target_user_id } = req.body;
      await this.userService.followUser({
        // @ts-ignore
        user_id: req.user?.user_id,
        target_user_id,
      });
      return res.send('follow success');
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  }
  async unFollowUser(req: Request, res: Response) {
    try {
      const { target_user_id } = req.body;
      await this.userService.unFollowUser({
        // @ts-ignore
        user_id: req.user?.user_id,
        target_user_id,
      });
      return res.send('unfollow success');
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  }
}
