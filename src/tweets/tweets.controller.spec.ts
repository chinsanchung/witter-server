import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tweet } from 'src/entities/tweet.entity';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';

const mockRepository = () => ({
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
        {
          provide: getRepositoryToken(Tweet),
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
        content: 'test content',
      };
      const message = '트윗을 작성했습니다.';

      jest.spyOn(service, 'createTweet').mockResolvedValue({ ok: true });

      const result = await controller.createTweet(mockUser, createTweetInput);

      expect(result).toEqual({ message });
    });
  });
});
