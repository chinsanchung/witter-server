import createError from 'http-errors';

export default (status: number, message: string): createError.HttpError => {
  return createError(status, message);
};
