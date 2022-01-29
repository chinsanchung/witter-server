import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tweet } from 'src/entities/tweet.entity';
import { Repository } from 'typeorm';
import { TweetsService } from './tweets.service';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
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

  describe('deleteTweet', () => {
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
    const badRequestErrorOutput = { ok: false, httpStatus: 400 };

    it('실패 - 존재하지 않는 트윗입니다.', async () => {
      tweetsRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await service.deleteTweet({
        user: mockUser,
        tweetId: tweetIdInput,
      });

      expect(tweetsRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(tweetsRepository.findOneOrFail).toHaveBeenCalledWith({
        id: tweetIdInput,
        user: mockUser,
      });
      expect(result).toEqual({
        ...badRequestErrorOutput,
        error: '존재하지 않는 트윗입니다.',
      });
    });
    it('실패 - 트윗의 작성자가 아닙니다.', async () => {
      tweetsRepository.findOneOrFail.mockResolvedValue({
        ...mockTweet,
        user: {
          ...mockUser,
          id: 2,
          user_id: 'testid2',
        },
      });

      const result = await service.deleteTweet({
        user: mockUser,
        tweetId: tweetIdInput,
      });

      expect(tweetsRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(tweetsRepository.findOneOrFail).toHaveBeenCalledWith({
        id: tweetIdInput,
        user: mockUser,
      });
      expect(result).toEqual({
        ...badRequestErrorOutput,
        error: '트윗의 작성자가 아닙니다.',
      });
    });
    it('성공 - 트윗 삭제 성공', async () => {
      tweetsRepository.findOneOrFail.mockResolvedValue({
        ...mockTweet,
        user: mockUser,
      });

      const result = await service.deleteTweet({
        user: mockUser,
        tweetId: tweetIdInput,
      });

      expect(tweetsRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(tweetsRepository.findOneOrFail).toHaveBeenCalledWith({
        id: tweetIdInput,
        user: mockUser,
      });
      expect(tweetsRepository.save).toHaveBeenCalledTimes(1);
      expect(tweetsRepository.save).toHaveBeenCalledWith({
        ...mockTweet,
        user: mockUser,
        activate: false,
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
