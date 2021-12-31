import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockRepository = () => ({
  findOne: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let jwtService: JwtService;

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
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
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
        .spyOn(service, 'checkUserValidAndReturnUser')
        .mockResolvedValue({ ok: false, error: errorOutput.error });
      jest.spyOn(service, 'login').mockResolvedValue(errorOutput);

      try {
        const result = await service.login(loginInput);
      } catch (e) {
        expect(e.status).toBe(400);
        expect(e.response).toBe(errorOutput.error);
      }
    });
    it('실패 - 비밀번호가 일치하지 않는 경우', async () => {
      const errorOutput = {
        ...defaultErrorOutput,
        error: '존재하지 않는 계정입니다.',
      };

      jest
        .spyOn(service, 'checkUserValidAndReturnUser')
        .mockResolvedValue({ ok: false, error: errorOutput.error });

      jest.spyOn(service, 'login').mockResolvedValue(errorOutput);

      try {
        const result = await service.login(loginInput);
      } catch (e) {
        expect(e.status).toBe(400);
        expect(e.response).toBe(errorOutput.error);
      }
    });
    it('성공 - 토큰 발급', async () => {
      const tokenList = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      jest
        .spyOn(service, 'checkUserValidAndReturnUser')
        .mockResolvedValue({ ok: true });

      jest.spyOn(service, 'login').mockResolvedValue({
        ok: true,
        data: tokenList,
      });

      const result = await service.login(loginInput);

      expect(result).toBe(tokenList);
    });
  });
});
