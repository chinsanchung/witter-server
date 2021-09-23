import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { IAuthService, JoinDto } from './auth.dto';
import Debugger from '../../utils/debugger';

export default class AuthController {
  private saltRound: number = 7;
  constructor(private authService: IAuthService) {}
  private convertPassword = (password: string): string => {
    const bcryptedPassword = bcrypt.hashSync(password, this.saltRound);
    return bcryptedPassword;
  };

  join = async (req: Request, res: Response) => {
    const { email, password, name, id, country }: JoinDto = req.body;
    try {
      const newPassword: string = this.convertPassword(password);
      await this.authService.join({
        email,
        password: newPassword,
        name,
        id,
        country,
        join_date: new Date(),
      });
      res.send('success');
    } catch (error) {
      Debugger.error(error);
      res.status(403).send('error');
    }
  };
}
