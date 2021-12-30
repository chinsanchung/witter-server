import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { CreateUserInput } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserInput: CreateUserInput): Promise<string> {
    const { ok, httpStatus, error } = await this.usersService.createUser(
      createUserInput,
    );

    if (ok) {
      return '유저 생성에 성공했습니다.';
    }
    throw new HttpException(error, httpStatus);
  }
}
