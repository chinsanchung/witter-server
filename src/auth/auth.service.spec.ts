import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

const mockRepository = () => ({
  findOne: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verifyAsync: jest.fn(),
  signAsync: jest.fn(),
});
const mockConfigService = () => ({
  get: jest.fn(() => 'secret-key'),
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
        {
          provide: ConfigService,
          useValue: mockConfigService(),
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

  describe('verifyToken', () => {
    it('실패 - 토큰이 유효하지 않습니다.', async () => {
      const token = 'invalid-token';
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

      const result = await service.verifyToken(token);

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'secret-key',
      });
      expect(result).toEqual({
        ok: false,
        error: 'INVALID_TOKEN',
      });
    });

    it('성공 - 유저 아이디를 리턴합니다.', async () => {
      const token = 'signed-token';
      const tokenPayload = { user_id: 'testid' };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(tokenPayload);

      const result = await service.verifyToken(token);

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'secret-key',
      });
      expect(result).toEqual({
        ok: true,
        data: tokenPayload,
      });
    });
  });

  describe('createAccessToken', () => {
    const createInput = {
      payload: { user_id: 'testid' },
      option: { expiresIn: '1h' },
    };
    it('실패 - 토큰 발급 과정에서 에러가 발생했습니다.', async () => {
      jest.spyOn(jwtService, 'signAsync').mockRejectedValue(new Error());

      const result = await service.createToken(createInput);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        createInput.payload,
        createInput.option,
      );

      expect(result).toEqual({
        ok: false,
        httpStatus: 500,
        error: '토큰 발급 과정에서 에러가 발생했습니다.',
      });
    });
    it('성공 - 토큰 발급', async () => {
      const mockToken = 'signed-token';
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);

      const result = await service.createToken(createInput);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        createInput.payload,
        createInput.option,
      );

      expect(result).toEqual({
        ok: true,
        data: mockToken,
      });
    });
  });
});
