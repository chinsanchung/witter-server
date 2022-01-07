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

  describe('editUser', () => {
    const mockUser = {
      id: 1,
      user_id: 'testid',
      password: '12345',
      created_at: new Date(),
      activate: true,
      hashPassword: jest.fn(),
    };
    it('실패 - Internal Server Error', async () => {
      const errorOutput = {
        ok: false,
        httpStatus: 500,
        error: '회원 정보를 갱신하는 과정에서 에러가 발생했습니다.',
      };
      jest.spyOn(service, 'editUser').mockResolvedValue(errorOutput);

      try {
        await controller.editUser(mockUser, {
          description: 'error result',
        });
      } catch (error) {
        expect(error.status).toBe(errorOutput.httpStatus);
        expect(error.response).toEqual(errorOutput.error);
      }
    });
    it('성공 - 프로필 수정', async () => {
      const editInput = { description: 'edited' };
      const message = '프로필을 수정했습니다.';

      jest
        .spyOn(service, 'editUser')
        .mockResolvedValue({ ok: true, data: message });

      const result = await controller.editUser(mockUser, editInput);

      expect(result).toEqual({ message });
    });
    it('성공 - 비밀번호 수정', async () => {
      const editInput = { password: '54321' };
      const message = '비밀번호를 변경했습니다.';

      jest
        .spyOn(service, 'editUser')
        .mockResolvedValue({ ok: true, data: message });

      const result = await controller.editUser(mockUser, editInput);

      expect(result).toEqual({ message });
    });
  });

  describe('deleteUser', () => {
    const mockUser = {
      id: 1,
      user_id: 'testid',
      password: '12345',
      created_at: new Date(),
      activate: true,
      hashPassword: jest.fn(),
    };
    it('성공 - 회원 탈퇴', async () => {
      const editInput = { activate: false };
      const message = '계정을 탈퇴했습니다.';

      jest
        .spyOn(service, 'editUser')
        .mockResolvedValue({ ok: true, data: message });

      const result = await controller.editUser(mockUser, editInput);

      expect(result).toEqual({ message });
    });
  });
});
