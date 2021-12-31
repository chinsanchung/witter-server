import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('bcrypt');

const mockRepository = () => ({
  findOne: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(),
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
      usersRepository.findOne.mockResolvedValue(undefined);
      service.checkUserValidAndReturnUser.mockResolvedValue({
        ok: false,
        error: errorOutput.error,
      });

      const result = await service.login(loginInput);

      expect(result).toMatchObject(errorOutput);
    });

    it('실패 - 비밀번호가 일치하지 않는 경우', async () => {
      const mockUser = { id: 1, user_id: 'testid', password: '54321' };
      const errorOutput = {
        ...defaultErrorOutput,
        error: '비밀번호가 일치하지 않습니다.',
      };
      usersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      service.checkUserValidAndReturnUser.mockResolvedValue({
        ok: false,
        error: errorOutput.error,
      });

      const result = await service.login(loginInput);

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        mockUser.password,
      );
      expect(result).toMatchObject(errorOutput);
    });

    it('성공 - 토큰 발급', async () => {
      const loginInput = { user_id: 'testid', password: '12345' };
      const mockUser = { ...loginInput, id: 1 };
      usersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      service.checkUserValidAndReturnUser.mockResolvedValue({
        ok: true,
        data: mockUser,
      });

      const result = await service.login(loginInput);

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith(mockUser);
      expect(result).toMatchObject({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });
});
