import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IOutputWithData } from 'src/common/output.interface';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTokenInputDto } from './dtos/create-token.dto';
import { LoginInputDto, LoginOutputDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async checkLoginValidtionAndReturnUser({
    user_id,
    password,
  }: LoginInputDto): Promise<IOutputWithData<User>> {
    try {
      const user = await this.users.findOne({ user_id });
      if (!user) {
        return {
          ok: false,
          httpStatus: 400,
          error: '존재하지 않는 계정입니다.',
        };
      }
      const isCorrectPassword = await bcrypt.compare(password, user.password);
      if (!isCorrectPassword) {
        return {
          ok: false,
          httpStatus: 400,
          error: '비밀번호가 일치하지 않습니다.',
        };
      }
      return { ok: true, data: user };
    } catch (error) {
      return {
        ok: false,
        httpStatus: 500,
        error: '조회 및 검증 과정에서 에러가 발생했습니다.',
      };
    }
  }

  async login(
    loginInput: LoginInputDto,
  ): Promise<IOutputWithData<LoginOutputDto>> {
    try {
      const { ok, httpStatus, error, data } =
        await this.checkLoginValidtionAndReturnUser(loginInput);

      if (!ok) {
        return { ok: false, httpStatus, error };
      }

      const accessToken = this.jwtService.sign(
        { user_id: data.user_id },
        {
          expiresIn: '1h',
        },
      );
      const refreshToken = this.jwtService.sign(
        { user_id: data.user_id },
        {
          expiresIn: '7d',
        },
      );
      return { ok: true, data: { accessToken, refreshToken } };
    } catch (error) {
      return {
        ok: false,
        httpStatus: 500,
        error: '로그인 과정에서 에러가 발생했습니다.',
      };
    }
  }

  async verifyToken(token: string): Promise<IOutputWithData<any>> {
    try {
      const result = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      return { ok: true, data: result };
    } catch (error) {
      return { ok: false, error: 'INVALID_TOKEN' };
    }
  }

  async createToken({
    payload,
    option,
  }: CreateTokenInputDto): Promise<IOutputWithData<{ accessToken: string }>> {
    try {
      const token = await this.jwtService.signAsync(payload, option);
      return { ok: true, data: { accessToken: token } };
    } catch (error) {
      return {
        ok: false,
        httpStatus: 500,
        error: '토큰 발급 과정에서 에러가 발생했습니다.',
      };
    }
  }
}
