import { PartialType, PickType } from '@nestjs/mapped-types';
import { User } from 'src/entities/user.entity';

export class EditUserInputDto extends PartialType(
  PickType(User, ['password', 'description', 'activate']),
) {}
