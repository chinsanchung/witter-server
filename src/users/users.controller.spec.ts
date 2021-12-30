import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockRepository = () => ({
  createUser: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

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
    it('실패: user_id 글자 수', async () => {
      const errorInfo = {
        ok: false,
        error: 'user_id: 5 ~ 12 글자로 입력해주세요.',
        httpStatus: 400,
      };
      jest.spyOn(service, 'createUser').mockResolvedValue(errorInfo);
      try {
        await controller.createUser({ ...userInput, user_id: 'te' });
      } catch (e) {
        console.log('ERR:', e);
        expect(e.status).toBe(400);
        expect(e.response).toBe(errorInfo.error);
      }
    });
    it('실패: password 글자 수', async () => {
      const errorInfo = {
        ok: false,
        error: 'password: 5 ~ 20 글자로 입력해주세요.',
        httpStatus: 400,
      };
      jest.spyOn(service, 'createUser').mockResolvedValue(errorInfo);
      try {
        await controller.createUser({ ...userInput, password: '123' });
      } catch (e) {
        console.log('ERR:', e);
        expect(e.status).toBe(400);
        expect(e.response).toBe(errorInfo.error);
      }
    });
    it('실패: description 글자 수', async () => {
      const errorInfo = {
        ok: false,
        error: 'description: 5 ~ 12 글자로 입력해주세요.',
        httpStatus: 400,
      };
      jest.spyOn(service, 'createUser').mockResolvedValue(errorInfo);
      try {
        await controller.createUser({
          ...userInput,
          description: 'a'.repeat(51),
        });
      } catch (e) {
        console.log('ERR:', e);
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
