import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';
import getCookies from '../util/get-cookies';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const cookiesStringFromHeader = request.headers?.cookie;
    const cookiesObject = getCookies(cookiesStringFromHeader);

    if (!cookiesObject['REFRESH_TOKEN']) {
      throw new HttpException('로그인이 필요한 기능입니다.', 401);
    }

    const checkRefreshTokenValidation = await this.authService.verifyToken(
      cookiesObject['REFRESH_TOKEN'],
    );

    if (checkRefreshTokenValidation.ok) {
      const { ok, data, httpStatus, error } =
        await this.usersService.findOneByUserId(
          checkRefreshTokenValidation.data.user_id,
        );
      if (ok) {
        request['user'] = data;
        return true;
      }
      throw new HttpException(error, httpStatus);
    }
    throw new HttpException('리프레시 토큰이 유효하지 않습니다.', 401);
  }
}
