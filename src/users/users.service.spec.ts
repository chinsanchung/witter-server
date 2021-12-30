import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create user', () => {
    const userInput = {
      user_id: 'testid',
      password: '12345',
      description: 'test description',
    };
    it('실패: 아이디 중복', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 1, user_id: 'testid' });
      const result = await service.createUser(userInput);
      expect(result).toEqual({
        ok: false,
        error: '이전에 가입한 회원의 아이디입니다.',
        httpStatus: 400,
      });
    });
    it('성공: 유저 생성', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(userInput);
      usersRepository.save.mockResolvedValue(userInput);

      const result = await service.createUser(userInput);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(userInput);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(userInput);
      expect(result).toEqual({ ok: true });
    });
  });
});
