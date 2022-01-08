import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as httpMocks from 'node-mocks-http';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockRepository = () => ({
  findOne: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(),
});
const mockConfigService = () => ({
  get: jest.fn(),
});

const mockResponse = httpMocks.createResponse();

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: ConfigService,
          useValue: mockConfigService(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginInput = { user_id: 'testid', password: '12345' };
    const badRequestErrorOutput = { ok: false, httpStatus: 400 };
    const mockUser = { ...loginInput, activate: true };

    it('실패 - 아이디가 일치하지 않는 경우', async () => {
      const errorOutput = {
        ...badRequestErrorOutput,
        error: '존재하지 않는 계정입니다.',
      };
      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue(errorOutput);
      jest.spyOn(service, 'login').mockResolvedValue(errorOutput);

      try {
        await controller.login(mockResponse, loginInput);
      } catch (e) {
        expect(e.status).toBe(errorOutput.httpStatus);
        expect(e.response).toBe(errorOutput.error);
      }
    });

    it('실패 - 비밀번호가 일치하지 않는 경우', async () => {
      const errorOutput = {
        ...badRequestErrorOutput,
        error: '비밀번호가 일치하지 않습니다.',
      };

      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue(errorOutput);

      jest.spyOn(service, 'login').mockResolvedValue(errorOutput);

      try {
        await controller.login(mockResponse, loginInput);
      } catch (e) {
        expect(e.status).toBe(errorOutput.httpStatus);
        expect(e.response).toBe(errorOutput.error);
      }
    });

    it('실패 - 탈퇴한 계정으로 로그인한 경우', async () => {
      const errorOutput = {
        ...badRequestErrorOutput,
        error: '탈퇴한 계정으로 로그인하실 수 없습니다.',
      };

      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue(errorOutput);

      jest.spyOn(service, 'login').mockResolvedValue(errorOutput);

      try {
        await controller.login(mockResponse, loginInput);
      } catch (e) {
        expect(e.status).toBe(errorOutput.httpStatus);
        expect(e.response).toBe(errorOutput.error);
      }
    });

    it('실패 - 토큰 발급 과정에서 에러가 발생', async () => {
      const errorOutput = {
        ok: false,
        httpStatus: 500,
        error: '토큰을 발급하는 과정에서 에러가 발생했습니다.',
      };
      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue({
          ok: true,
          data: mockUser,
        });
      jest.spyOn(service, 'login').mockResolvedValue(errorOutput);

      try {
        await controller.login(mockResponse, loginInput);
      } catch (e) {
        expect(e.status).toBe(errorOutput.httpStatus);
        expect(e.response).toBe(errorOutput.error);
      }
    });

    it('성공 - 토큰 발급', async () => {
      const loginOutput = {
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      };
      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue({
          ok: true,
          data: mockUser,
        });
      jest.spyOn(service, 'login').mockResolvedValue({
        ok: true,
        data: loginOutput,
      });

      const result = await controller.login(mockResponse, loginInput);

      expect(result).toEqual({ accessToken: loginOutput.accessToken });
    });
  });

  describe('logout', () => {
    it('성공 - 로그아웃', async () => {
      const result = controller.logout(mockResponse);

      expect(result).toEqual('로그아웃을 완료했습니다.');
    });
  });

  describe('createAccessToken', () => {
    const mockUser = {
      id: 1,
      user_id: 'testid',
      password: '12345',
      created_at: new Date(),
      activate: true,
      hashPassword: jest.fn(),
    };

    it('실패 - 토큰 발급 과정에서 에러가 발생했습니다.', async () => {
      const errorOutput = {
        ok: false,
        httpStatus: 500,
        error: '토큰 발급 과정에서 에러가 발생했습니다.',
      };
      jest.spyOn(service, 'createToken').mockResolvedValue(errorOutput);

      try {
        await controller.createAccessToken(mockUser);
      } catch (error) {
        expect(service.createToken).toHaveBeenCalledTimes(1);
        expect(service.createToken).toHaveBeenCalledWith({
          payload: { user_id: mockUser.user_id },
          option: { expiresIn: '1h' },
        });
        expect(error.status).toBe(errorOutput.httpStatus);
        expect(error.response).toBe(errorOutput.error);
      }
    });

    it('성공 - 새로운 access token 을 발급합니다.', async () => {
      const createTokenOutput = { accessToken: 'signed-token' };

      jest.spyOn(service, 'createToken').mockResolvedValue({
        ok: true,
        data: createTokenOutput.accessToken,
      });

      const result = await controller.createAccessToken(mockUser);

      expect(service.createToken).toHaveBeenCalledTimes(1);
      expect(service.createToken).toHaveBeenCalledWith({
        payload: { user_id: mockUser.user_id },
        option: { expiresIn: '1h' },
      });
      expect(result).toEqual(createTokenOutput);
    });
  });
});
