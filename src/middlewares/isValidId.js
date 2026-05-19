import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, _res, next) => {
  const id = req.params.id ?? req.params.authorId;

  if (!isValidObjectId(id)) {
    throw createHttpError(400, 'Invalid id');
  }

  next();
};
