import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
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
      usersRepository.findOne.mockResolvedValue(null);
      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue({
          ...defaultErrorOutput,
          error: errorOutput.error,
        });

      const result = await service.login(loginInput);

      expect(service.checkLoginValidtionAndReturnUser).toHaveBeenCalledTimes(1);
      expect(service.checkLoginValidtionAndReturnUser).toHaveBeenCalledWith(
        loginInput,
      );
      expect(result).toEqual(errorOutput);
    });

    it('실패 - 비밀번호가 일치하지 않는 경우', async () => {
      const mockUser = { id: 1, user_id: 'testid', password: '54321' };
      const errorOutput = {
        ...defaultErrorOutput,
        error: '비밀번호가 일치하지 않습니다.',
      };
      usersRepository.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue({
          ...defaultErrorOutput,
          error: errorOutput.error,
        });

      const result = await service.login(loginInput);

      expect(service.checkLoginValidtionAndReturnUser).toHaveBeenCalledTimes(1);
      expect(service.checkLoginValidtionAndReturnUser).toHaveBeenCalledWith(
        loginInput,
      );
      expect(result).toEqual(errorOutput);
    });

    it('성공 - 토큰 발급', async () => {
      const loginInput = { user_id: 'testid', password: '12345' };
      const mockUser = {
        ...loginInput,
        id: 1,
        created_at: new Date(),
        hashPassword: jest.fn(),
      };
      usersRepository.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(service, 'checkLoginValidtionAndReturnUser')
        .mockResolvedValue({
          ok: true,
          data: mockUser,
        });

      const result = await service.login(loginInput);

      expect(service.checkLoginValidtionAndReturnUser).toHaveBeenCalledTimes(1);
      expect(service.checkLoginValidtionAndReturnUser).toHaveBeenCalledWith(
        loginInput,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          user_id: mockUser.user_id,
        },
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: true,
        data: {
          accessToken: 'signed-token',
          refreshToken: 'signed-token',
        },
      });
    });
  });

  describe('verifyUserAuth', () => {
    const defaultErrorOutput = { ok: false, httpStatus: 401 };

    it('실패 - 토큰이 존재하지 않습니다.', async () => {
      const errorAuthInput = {
        accessToken: undefined,
        refreshToken: undefined,
      };
      const errorOutput = {
        ...defaultErrorOutput,
        error: '로그인이 필요한 기능입니다.',
      };
      jest
        .spyOn(service, 'checkTokenValidation')
        .mockResolvedValue(errorOutput);

      const result = await service.verifyUserAuth(errorAuthInput);

      expect(service.checkTokenValidation).toHaveBeenCalledTimes(1);
      expect(service.checkTokenValidation).toHaveBeenCalledWith(errorAuthInput);
      expect(service.checkTokenValidation).toEqual(errorOutput);

      expect(result).toEqual(errorOutput);
    });

    it('실패 - 유효한 토큰이 아닙니다.', async () => {
      const authInput = {
        accessToken: 'not-signed-token',
        refreshToken: 'not-signed-token',
      };
      const errorOutput = {
        ...defaultErrorOutput,
        error: '유효한 토큰이 아닙니다.',
      };
      jest
        .spyOn(service, 'checkTokenValidation')
        .mockResolvedValue(errorOutput);

      const result = await service.verifyUserAuth(authInput);

      expect(service.checkTokenValidation).toHaveBeenCalledTimes(1);
      expect(service.checkTokenValidation).toHaveBeenCalledWith(authInput);
      expect(service.checkTokenValidation).toEqual(errorOutput);

      expect(result).toEqual(errorOutput);
    });

    it('실패 - 엑세스 토큰 만료, 리프레시 토큰 유효, 새 액세스 토큰 발급', async () => {
      const authInput = {
        accessToken: undefined,
        refreshToken: 'signed-token',
      };
      const errorOutput = {
        ...defaultErrorOutput,
        error: 'RETURN_NEW_TOKEN',
      };
      jest
        .spyOn(service, 'checkTokenValidation')
        .mockResolvedValue(errorOutput);

      const result = await service.verifyUserAuth(authInput);

      expect(service.checkTokenValidation).toHaveBeenCalledTimes(1);
      expect(service.checkTokenValidation).toHaveBeenCalledWith(authInput);

      expect(result).toEqual({
        ...defaultErrorOutput,
        data: { accessToken: 'signed-token' },
      });
    });

    it('성공 - 모든 토큰 유효함, 유저 데이터를 리턴', async () => {
      const authInput = {
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      };
      const outputWithAccessToken = {
        ok: true,
        data: { user_id: 'testid' },
      };
      const mockUser = {
        id: 1,
        user_id: 'testid',
        password: '12345',
        created_at: new Date(),
        hashPassword: jest.fn(),
      };
      jest
        .spyOn(service, 'checkTokenValidation')
        .mockResolvedValue(outputWithAccessToken);
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.verifyUserAuth(authInput);

      expect(service.checkTokenValidation).toHaveBeenCalledTimes(1);
      expect(service.checkTokenValidation).toHaveBeenCalledWith(authInput);

      expect(result).toEqual({
        ok: true,
        data: mockUser,
      });
    });
  });
});
