import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { IOutput, IOutputWithData } from 'src/common/output.interface';
import { CreateUserInput } from './dtos/create-user.dto';

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
}
