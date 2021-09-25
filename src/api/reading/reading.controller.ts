import { Request, Response } from 'express';
import ReadingService from './reading.service';
import Debugger from '../../utils/debugger';

export default class ReadingController {
  constructor(private readingService: ReadingService) {}

  getTweets = async (req: Request, res: Response) => {
    try {
      Debugger.log('트윗 읽기 시작: ', req.params);
      const tweet_id: number = parseInt(req.params.tweetid);
      const response = await this.readingService.getTweets(tweet_id);
      return res.json(response);
    } catch (error) {
      Debugger.error(error);
      return res.status(error.status).send(error.message);
    }
  };

  getUserTimeLine = async (req: Request, res: Response) => {
    try {
      Debugger.log('특정 사용자의 타임라인 읽기 시작', req.params);
      const user_id: string = req.params.userid;
      const response = await this.readingService.getUserTimeLine(user_id);
      return res.json(response);
    } catch (error) {
      Debugger.error(error);
      return res.json([]);
    }
  };

  getHomeTimeLine = async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const { user_id, following }: IUser = req.user;
      // const user_id = 'testID';
      // const following = ['NASA'];
      const response = await this.readingService.getHomeTimeLine({
        user_id,
        following,
      });
      return res.json(response);
    } catch (error) {
      Debugger.error(error);
      return res.json([]);
    }
  };
}
