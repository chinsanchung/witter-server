import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/entities/user.entity';

export class CheckLoginValidationDto extends PickType(User, [
  'user_id',
  'password',
  'activate',
]) {}
