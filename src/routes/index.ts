import express from 'express';
import authRouter from './auth';

const routesList: [{ path: string; router: express.Router }] = [
  { path: '/auth', router: authRouter },
];

export default routesList;
