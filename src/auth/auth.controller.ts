import { Body, Controller, HttpException, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginInputDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/login')
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() loginInput: LoginInputDto,
  ): Promise<{
    accessToken: string;
  }> {
    const { ok, httpStatus, data, error } = await this.authService.login(
      loginInput,
    );

    if (ok) {
      // 리프레시 토큰의 만료일을 jwt 와 동일하게 7일으로 설정합니다.
      response.cookie('refresh-token', data.refreshToken, {
        httpOnly: true,
        secure:
          this.configService.get('NODE_ENV') === 'production' ? true : false,
        maxAge: 86400000,
      });
      return { accessToken: data.accessToken };
    }
    throw new HttpException(error, httpStatus);
  }
}
