import { JwtSignOptions } from '@nestjs/jwt';

export class CreateTokenInputDto {
  payload: { user_id: string };
  option: JwtSignOptions;
}
