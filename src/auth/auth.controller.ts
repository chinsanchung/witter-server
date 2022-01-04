import {
  Body,
  Controller,
  HttpException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';
import { UserId } from './decorators/user.decorator';
import { LoginInputDto } from './dtos/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

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
      response.cookie('REFRESH_TOKEN', data.refreshToken, {
        httpOnly: true,
        secure:
          this.configService.get('NODE_ENV') === 'production' ? true : false,
        maxAge: 86400000,
      });
      return { accessToken: data.accessToken };
    }
    throw new HttpException(error, httpStatus);
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) response: Response): string {
    response.clearCookie('refresh-token');
    return '로그아웃을 완료했습니다.';
  }

  @Post('/token')
  @UseGuards(RefreshTokenGuard)
  async createAccessToken(@UserId() user: User) {
    const { ok, data, httpStatus, error } = await this.authService.createToken({
      payload: { user_id: user.user_id },
      option: { expiresIn: '1h' },
    });

    if (ok) {
      return data;
    }
    throw new HttpException(error, httpStatus);
  }
}
