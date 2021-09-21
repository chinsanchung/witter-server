import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import Debugger from './utils/debugger';
import Database from './database';
// process.env.MONGO_URI

dotenv.config();

// export default class App {
//   private app: express.Application;
//   static app: express.Application;

//   constructor() {
//     this.app = express();
//   }

//   // public static getAppInstance = (): express.Application => {
//   //   return this.app;
//   // };

//   private setApp = (): void => {
//     this.app.use(express.json());
//     this.app.use(express.urlencoded({ extended: false }));
//     this.app.use(cookieParser(process.env.COOKIE_SECRET));
//     this.app.use(
//       session({
//         resave: false,
//         saveUninitialized: false,
//         secret: process.env.COOKIE_SECRET,
//         cookie: { httpOnly: true, secure: false },
//         name: 'session-cookie',
//       })
//     );
//   };

//   public initialize = () => {
//     Database.init(process.env.MONGO_URI)
//       .then(() => {
//         Debugger.log('데이터베이스 연결');
//         this.setApp();
//         this.app.listen(3000, () => Debugger.log('서버 시작'));
//       })
//       .catch((error) => {});
//   };
// }

const app: express.Application = express();

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV === 'production') morgan('combined');
    else morgan('dev');
  }
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: { httpOnly: true, secure: false },
    name: 'session-cookie',
  })
);

export default app;
