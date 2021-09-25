import { Request, Response } from 'express';
import { ITweetService, ICreateDto, ICommentDto } from './tweet.interface';
import Debugger from '../../utils/debugger';
import { ITweet } from '../../models/Tweet';
import { IUser } from '../../models/User';

export default class TweetController {
  constructor(private tweetService: ITweetService) {}
  private createQuery = (req: Request, user_id: string): ICreateDto => {
    const { tweet_id, contents, comments } = req.body;
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
    return query;
  };
  createTweet = async (req: Request, res: Response) => {
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // const user_id = 'testID';
    // Debugger.log('body', req.body);

    const query = this.createQuery(req, user_id);

    try {
      const newTweet = await this.tweetService.createTweet(query);
      return res.json(newTweet);
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

  doRetweet = async (req: Request, res: Response) => {
    const { tweet_id } = req.body;
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // const user_id = 'testID';
    try {
      await this.tweetService.doRetweet({
        tweet_id,
        user_id,
      });
      return res.send('doRetweet success');
    } catch (error) {
      Debugger.error(error);
      return res.status(error.status).send(error.message);
    }
  };
  unDoRetweet = async (req: Request, res: Response) => {
    const { tweet_id } = req.body;
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // const user_id = 'testID';
    try {
      await this.tweetService.unDoRetweet({
        tweet_id,
        user_id,
      });
      return res.send('unDoRetweet success');
    } catch (error) {
      Debugger.error(error);
      return res.status(error.status).send(error.message);
    }
  };

  doLike = async (req: Request, res: Response) => {
    const { tweet_id } = req.body;
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // const user_id = 'testID';
    try {
      await this.tweetService.doLike({
        tweet_id,
        user_id,
      });
      return res.send('doLike success');
    } catch (error) {
      Debugger.error(error);
      return res.status(error.status).send(error.message);
    }
  };
  unDoLike = async (req: Request, res: Response) => {
    const { tweet_id } = req.body;
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // const user_id = 'testID';
    try {
      await this.tweetService.unDoLike({
        tweet_id,
        user_id,
      });
      return res.send('unDoLike success');
    } catch (error) {
      Debugger.error(error);
      return res.status(error.status).send(error.message);
    }
  };

  addCommentTweet = async (req: Request, res: Response) => {
    // @ts-ignore
    const user_id: IUser['user_id'] = req.user?.user_id;
    // const user_id = 'testID';
    // Debugger.log('body', req.body);
    const { target_tweet_id } = req.body;
    const query = this.createQuery(req, user_id);
    try {
      const newCommentTweet = await this.tweetService.addCommentTweet({
        tweet: query,
        target_tweet_id,
      });
      return res.json(newCommentTweet);
    } catch (error) {
      Debugger.error(error.message);
      return res.status(error.status).send(error.message);
    }
  };
  deleteCommentTweet = async (req: Request, res: Response) => {
    const { orig_tweet_id, comment_tweet_id } = req.body;

    try {
      // @ts-ignore
      const user_id: IUser['user_id'] = req.user?.user_id;
      // const user_id = 'testID';
      await this.tweetService.deleteCommentTweet(
        orig_tweet_id,
        comment_tweet_id,
        user_id
      );
      return res.send('delete comment_tweet');
    } catch (error) {
      return res.status(error.status).send(error.message);
    }
  };
}
