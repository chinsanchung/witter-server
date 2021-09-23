import { IUser } from '../../models/User';

export interface JoinDto {
  readonly email: string; // 로그인 계정
  readonly password: string;
  readonly name: string; // 닉네임
  readonly id: string; // @ 로 시작하는 아이디
  readonly join_date: Date;
  readonly country: string;
}

export interface IAuthService {
  join(user: JoinDto): Promise<IUser>;
}
