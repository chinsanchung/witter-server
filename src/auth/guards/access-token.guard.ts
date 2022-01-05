import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';
import getCookies from '../util/get-cookies';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const cookiesStringFromHeader = request.headers?.cookie;
    const cookiesObject = getCookies(cookiesStringFromHeader);

    if (!accessToken && !cookiesObject['REFRESH_TOKEN']) {
      throw new HttpException('로그인이 필요한 기능입니다.', 401);
    }

    const checkAccessTokenValidation = await this.authService.verifyToken(
      accessToken,
    );
    if (checkAccessTokenValidation.ok) {
      const { ok, data, httpStatus, error } =
        await this.usersService.findOneByUserId(
          checkAccessTokenValidation.data.user_id,
        );
      if (ok) {
        request['user'] = data;
        return true;
      }
      throw new HttpException(error, httpStatus);
    }
    throw new HttpException('NEED_REFRESH_TOKEN', 401);
  }
}
