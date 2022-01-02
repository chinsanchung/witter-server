import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as httpMocks from 'node-mocks-http';
import { User } from 'src/entities/user.entity';
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
    const defaultErrorOutput = { ok: false, httpStatus: 400 };

    it('실패 - 아이디가 일치하지 않는 경우', async () => {
      const errorOutput = {
        ...defaultErrorOutput,
        error: '존재하지 않는 계정입니다.',
      };
      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue({ ok: false, error: errorOutput.error });
      jest.spyOn(service, 'login').mockResolvedValue(errorOutput);

      try {
        await controller.login(mockResponse, loginInput);
      } catch (e) {
        expect(e.status).toBe(400);
        expect(e.response).toBe(errorOutput.error);
      }
    });
    it('실패 - 비밀번호가 일치하지 않는 경우', async () => {
      const errorOutput = {
        ...defaultErrorOutput,
        error: '비밀번호가 일치하지 않습니다.',
      };

      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue({ ok: false, error: errorOutput.error });

      jest.spyOn(service, 'login').mockResolvedValue(errorOutput);

      try {
        await controller.login(mockResponse, loginInput);
      } catch (e) {
        expect(e.status).toBe(400);
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
        .mockResolvedValue({ ok: true });
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
});
