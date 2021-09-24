import { Request, Response } from 'express';
import { ITweetService, ICreateDto } from './tweet.interface';
import Debugger from '../../utils/debugger';
import { ITweet } from '../../models/Tweet';
import { IUser } from '../../models/User';

export default class TweetController {
  constructor(private tweetService: ITweetService) {}

  createTweet = async (req: Request, res: Response) => {
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // Debugger.log('body', req.body);
    const { tweet_id, contents, comments }: ICreateDto = req.body;

    const query: ICreateDto = {
      tweet_id,
      writer_id: user_id,
      contents,
      create_date: new Date(),
      comments,
    };

    if (Object.prototype.hasOwnProperty.call(req, 'files')) {
      // 이미지(최대 4개) 파일을 업로드하는 경우입니다.
      const images = [];
      //@ts-ignore
      for (const file of req.images) {
        images.push({ key: file.key, url: file.location });
      }
      query.image = images;
    } else if (Object.prototype.hasOwnProperty.call(req, 'file')) {
      // 비디오 파일 1개를 업로드하는 경우입니다.
      //@ts-ignore
      query.video = { key: req.file.key, url: req.file.location };
    }

    try {
      await this.tweetService.createTweet(query);
      return res.send('success');
    } catch (error) {
      Debugger.error(error.message);
      return res.status(error.status).send(error.message);
    }
  };
  deleteTweet = async (req: Request, res: Response) => {
    const { tweet_id } = req.body;
    try {
      await this.tweetService.deleteTweet(tweet_id);
      return res.send('delete success');
    } catch (error) {
      Debugger.error(error.message);
      return res.status(error.status).send(error.message);
    }
  };
  doTweetAction = async (req: Request, res: Response) => {
    const { tweet_id, action_type, action } = req.body;
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // const user_id = 'testID';
    try {
      await this.tweetService.doTweetAction({
        tweet_id,
        user_id,
        action_type,
        action,
      });
      return res.send('tweet action success');
    } catch (error) {
      Debugger.error(error);
      return res.status(error.status).send(error.message);
    }
  };
}
