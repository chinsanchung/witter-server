import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
// import redis from 'redis';
// import connectRedis from 'connect-redis';
import passport from 'passport';
import PassportConfig from './middlewares/passportConfig';
import Debugger from './utils/debugger';
import Database from './middlewares/database';

dotenv.config();

export default class App extends Error {
  private app: express.Application;
  // private RedisStore: connectRedis.RedisStore;
  // private redisClient: redis.RedisClient;

  constructor() {
    super();
    this.app = express();
    PassportConfig();
    // this.RedisStore = connectRedis(session);
    // this.redisClient = redis.createClient({
    //   url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    //   password: process.env.REDIS_PASSWORD,
    // });
  }

  private setApplication = (): void => {
    this.app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        if (process.env.NODE_ENV === 'production') morgan('combined');
        else morgan('dev');
      }
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser(process.env.COOKIE_SECRET));
    this.app.use(
      session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: { httpOnly: true, secure: false },
        // store: new this.RedisStore({ client: this.redisClient }),
      })
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  };

  public initialize = (): void => {
    Database.init(process.env.MONGO_URI)
      .then(() => {
        this.setApplication();
        this.app.listen(3000, () => Debugger.log('서버 시작'));
      })
      .catch((error: Error) => {
        Debugger.error(error);
        throw new Error(error.message);
      });
  };
}
