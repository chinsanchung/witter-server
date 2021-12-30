import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/entities/user.entity';

export class CreateUserInput extends PickType(User, [
  'user_id',
  'password',
  'description',
]) {}
