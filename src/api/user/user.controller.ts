import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { JoinDto } from './user.interface';
import Debugger from '../../utils/debugger';
import { IUserService } from './user.interface';

export default class UserController {
  constructor(private userService: IUserService) {
    this.convertPassword = this.convertPassword.bind(this);

    this.join = this.join.bind(this);
    this.getFollowerList = this.getFollowerList.bind(this);
    this.getFollowingList = this.getFollowingList.bind(this);
    this.changeProfile = this.changeProfile.bind(this);
    this.followUser = this.followUser.bind(this);
    this.unFollowUser = this.unFollowUser.bind(this);
  }
  private saltRound: number = 7;
  private convertPassword(password: string): string {
    const bcryptedPassword = bcrypt.hashSync(password, this.saltRound);
    return bcryptedPassword;
  }

  async join(req: Request, res: Response) {
    const { email, password, name, user_id, profile_color }: JoinDto = req.body;
    Debugger.log(req.body);
    try {
      const newPassword: string = this.convertPassword(password);
      await this.userService.join({
        email,
        password: newPassword,
        name,
        user_id,
        join_date: new Date(),
        profile_color,
      });
      return res.send('success');
    } catch (error) {
      Debugger.error(error);
      return res.status(error?.status).send(error?.message);
    }
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
