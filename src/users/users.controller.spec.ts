import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockRepository = () => ({
  createUser: jest.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create user', () => {
    const userInput = {
      user_id: 'testid',
      password: '12345',
      description: 'test description',
    };

    it('실패: 아이디 중복', async () => {
      const errorInfo = {
        ok: false,
        error: '이전에 가입한 회원의 아이디입니다.',
        httpStatus: 400,
      };
      jest.spyOn(service, 'createUser').mockResolvedValue(errorInfo);
      try {
        await controller.createUser(userInput);
      } catch (e) {
        expect(e.status).toBe(400);
        expect(e.response).toBe(errorInfo.error);
      }
    });
    it('성공: 유저 생성', async () => {
      const message = '유저 생성에 성공했습니다.';
      jest.spyOn(service, 'createUser').mockResolvedValue({ ok: true });

      const result = await controller.createUser(userInput);
      expect(result).toBe(message);
    });
  });
});
