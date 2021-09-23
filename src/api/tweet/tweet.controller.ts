import { Request, Response } from 'express';
import { ITweetService, CreateDto } from './tweet.dto';
import Debugger from '../../utils/debugger';
import { ITweet } from '../../models/Tweet';
import { IUser } from '../../models/User';

export default class TweetController {
  constructor(private tweetService: ITweetService) {}

  createTweet = async (req: Request, res: Response) => {
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // Debugger.log('body', req.body);
    const { tweet_id, media, contents, comments }: CreateDto = req.body;

    try {
      await this.tweetService.createTweet({
        tweet_id,
        writer_id: user_id,
        media,
        contents,
        create_date: new Date(),
        comments,
      });
      return res.send('success');
    } catch (error) {
      Debugger.error(error.status);
      return res.status(error.status).send(error.message);
    }
  };
  deleteTweet = async (req: Request, res: Response) => {
    const { tweet_id } = req.body;
    try {
      await this.tweetService.deleteTweet(tweet_id);
      return res.send('delete success');
    } catch (error) {
      Debugger.error(error.status);
      return res.status(error.status).send(error.message);
    }
  };
}
