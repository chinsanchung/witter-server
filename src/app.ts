import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import createError from './utils/createError';
import cors from 'cors';
import redis from 'redis';
import connectRedis from 'connect-redis';
import passport from 'passport';
import path from 'path';
import PassportConfig from './middlewares/passportConfig';
import Debugger from './utils/debugger';
import Database from './middlewares/database';
import routes from './routes';

dotenv.config();

export default class App {
  private app: express.Application;
  // private PORT: number = process.env.NODE_ENV === 'production' ? 80 : 5000;
  private PORT: number = 80;
  private RedisStore: connectRedis.RedisStore;
  private redisClient: redis.RedisClient;

  constructor() {
    this.app = express();
    PassportConfig();
    this.RedisStore = connectRedis(session);
    this.redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
    });
  }

  private setApplication = (): void => {
    this.app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        morgan('combined')(req, res, next);
        // if (process.env.NODE_ENV === 'production') {
        //   morgan('combined')(req, res, next);
        // } else {
        //   morgan('dev')(req, res, next);
        // }
      }
    );
    this.app.use(
      cors({
        origin: [
          'http://localhost:3000',
          'http://localhost:5000',
          'http://localhost:8080',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
      })
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
        store: new this.RedisStore({ client: this.redisClient }),
      })
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  };

  private setRoutes = (): void => {
    this.app.use('/api', routes);
    // for (const route of routesList) {
    //   this.app.use(route.path, route.router);
    // }
  };

  public initialize = (): void => {
    Database.init(process.env.MONGO_URI)
      .then(() => {
        this.setApplication();
        this.setRoutes();

        // if (process.env.NODE_ENV === 'production') {
        //   this.app.use(express.static(path.join(__dirname, '../client_build')));
        //   this.app.get('/', (req, res) => {
        //     res.sendFile(path.join(__dirname, '../client_build', 'index.html'));
        //   });
        // }
        this.app.use(express.static(path.join(__dirname, '../client_build')));
        this.app.get('/', (req, res) => {
          res.sendFile(path.join(__dirname, '../client_build', 'index.html'));
        });
        this.app.listen(this.PORT, () =>
          Debugger.log(`포트 ${this.PORT}. 서버 시작`)
        );
      })
      .catch((error) => {
        Debugger.error(error);
        throw createError(error.status, error.message);
      });
  };
}
