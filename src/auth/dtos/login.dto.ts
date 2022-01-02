import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/entities/user.entity';

export class LoginInputDto extends PickType(User, ['user_id', 'password']) {}

export class LoginOutputDto {
  accessToken: string;
  refreshToken: string;
}
