import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tweet } from 'src/entities/tweet.entity';
import { Repository } from 'typeorm';
import { TweetsService } from './tweets.service';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('TweetsService', () => {
  let service: TweetsService;
  let tweetsRepository: MockRepository<Tweet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: getRepositoryToken(Tweet),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
    tweetsRepository = module.get(getRepositoryToken(Tweet));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTweet', () => {
    const mockUser = {
      id: 1,
      user_id: 'testid',
      password: '12345',
      description: 'default',
      activate: true,
      created_at: new Date(),
      hashPassword: jest.fn(),
    };
    it('성공: 트윗 생성', async () => {
      const createTweetInput = {
        contents: 'test content',
      };
      const newTweet = {
        id: 1,
        contents: createTweetInput.contents,
        created_at: new Date(),
        activate: true,
      };
      tweetsRepository.create.mockReturnValue(newTweet);
      tweetsRepository.save.mockResolvedValue(newTweet);

      const result = await service.createTweet({
        user: mockUser,
        payload: createTweetInput,
      });

      expect(tweetsRepository.create).toHaveBeenCalledTimes(1);
      expect(tweetsRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        contents: createTweetInput.contents,
      });
      expect(tweetsRepository.save).toHaveBeenCalledTimes(1);
      expect(tweetsRepository.save).toHaveBeenCalledWith(newTweet);
      expect(result).toEqual({ ok: true, data: newTweet });
    });
  });
});
