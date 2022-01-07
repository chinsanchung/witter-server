import {
  Body,
  Controller,
  Delete,
  HttpException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserParam } from 'src/auth/decorators/user.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { User } from 'src/entities/user.entity';
import { CreateUserInput } from './dtos/create-user.dto';
import { EditUserInputDto } from './dtos/edit-user.dto';
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

  @Patch()
  @UseGuards(AccessTokenGuard)
  async editUser(
    @UserParam() user: User,
    @Body() payload: EditUserInputDto,
  ): Promise<{ message: string }> {
    const { ok, data, httpStatus, error } = await this.usersService.editUser({
      user,
      payload,
    });

    if (ok) {
      return { message: data };
    }
    throw new HttpException(error, httpStatus);
  }

  @Delete()
  @UseGuards(AccessTokenGuard)
  async deleteUser(@UserParam() user: User): Promise<{ message: string }> {
    const { ok, data, httpStatus, error } = await this.usersService.editUser({
      user,
      payload: { activate: false },
    });

    if (ok) {
      return { message: data };
    }
    throw new HttpException(error, httpStatus);
  }
}
