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
});
