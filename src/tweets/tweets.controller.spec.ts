import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tweet } from 'src/entities/tweet.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('TweetsController', () => {
  let controller: TweetsController;
  let service: TweetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TweetsController],
      providers: [
        TweetsService,
        UsersService,
        {
          provide: getRepositoryToken(Tweet),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    controller = module.get<TweetsController>(TweetsController);
    service = module.get<TweetsService>(TweetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createTweet', () => {
    it('성공: 트윗 생성', async () => {
      const mockUser = {
        id: 1,
        user_id: 'testid',
        password: '12345',
        created_at: new Date(),
        activate: true,
        hashPassword: jest.fn(),
      };
      const createTweetInput = {
        contents: 'test content',
      };
      const newTweet = {
        id: 1,
        contents: createTweetInput.contents,
        created_at: new Date(),
        activate: true,
        user: mockUser,
      };

      jest
        .spyOn(service, 'createTweet')
        .mockResolvedValue({ ok: true, data: newTweet });

      const result = await controller.createTweet(mockUser, createTweetInput);

      expect(result).toEqual({ data: newTweet });
    });
  });

  describe('deleteTweet', () => {
    const badRequestErrorOutput = { ok: false, httpStatus: 400 };
    const mockUser = {
      id: 1,
      user_id: 'testid',
      password: '12345',
      description: 'default',
      activate: true,
      created_at: new Date(),
      hashPassword: jest.fn(),
    };
    const mockTweet = {
      id: 1,
      contents: 'test content',
      created_at: new Date(),
      activate: true,
    };
    const tweetIdInput = 1;

    it('실패 - 존재하지 않는 트윗입니다.', async () => {
      const errorOutput = {
        ...badRequestErrorOutput,
        error: '존재하지 않는 트윗입니다.',
      };
      jest.spyOn(service, 'deleteTweet').mockResolvedValue(errorOutput);
      try {
        await controller.deleteTweet(mockUser, tweetIdInput);
      } catch (e) {
        expect(e.status).toBe(errorOutput.httpStatus);
        expect(e.response).toBe(errorOutput.error);
      }
    });
    it('실패 - 트윗의 작성자가 아닙니다.', async () => {
      const errorOutput = {
        ...badRequestErrorOutput,
        error: '트윗의 작성자가 아닙니다.',
      };
      jest.spyOn(service, 'deleteTweet').mockResolvedValue(errorOutput);
      try {
        await controller.deleteTweet(mockUser, tweetIdInput);
      } catch (e) {
        expect(e.status).toBe(errorOutput.httpStatus);
        expect(e.response).toBe(errorOutput.error);
      }
    });
    it('성공 - 트윗 삭제 성공', async () => {
      jest.spyOn(service, 'deleteTweet').mockResolvedValue({ ok: true });

      const result = await controller.deleteTweet(mockUser, tweetIdInput);

      expect(result).toEqual({ message: '삭제를 완료했습니다.' });
    });
  });
});
