import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { IOutput, IOutputWithData } from 'src/common/output.interface';
import { CreateUserInput } from './dtos/create-user.dto';
import { EditUserInputDto } from './dtos/edit-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async createUser(createUserInput: CreateUserInput): Promise<IOutput> {
    try {
      const existUser = await this.users.findOne({
        user_id: createUserInput.user_id,
      });
      if (existUser) {
        return {
          ok: false,
          httpStatus: 400,
          error: '이전에 가입한 회원의 아이디입니다.',
        };
      }
      const user = this.users.create(createUserInput);
      await this.users.save(user);

      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        httpStatus: 500,
        error: '유저 생성 과정에서 에러가 발생했습니다.',
      };
    }
  }

  async findOneByUserId(user_id: string): Promise<IOutputWithData<User>> {
    try {
      const user = await this.users.findOneOrFail({ user_id });
      return { ok: true, data: user };
    } catch (error) {
      return { ok: false, httpStatus: 400, error: '유저가 존재하지 않습니다.' };
    }
  }

  async editUser({
    user,
    payload,
  }: {
    user: User;
    payload: EditUserInputDto;
  }): Promise<IOutputWithData<string>> {
    try {
      const { description, password } = payload;
      let message = '';
      if (description) {
        user.description = description;
        message = '프로필을 수정했습니다.';
      }
      if (password) {
        user.password = password;
        message = '비밀번호를 변경했습니다.';
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'activate')) {
        user.activate = false;
        message = '계정을 탈퇴했습니다.';
      }

      await this.users.save(user);

      return { ok: true, data: message };
    } catch (error) {
      return {
        ok: false,
        httpStatus: 500,
        error: '회원 정보를 갱신하는 과정에서 에러가 발생했습니다.',
      };
    }
  }
}
