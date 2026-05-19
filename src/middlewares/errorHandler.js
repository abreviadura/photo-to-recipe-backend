import { HttpError } from 'http-errors';

export const errorHandler = (err, _req, res, _next) => {
  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large (max 5MB)'
        : err.message;
    res.status(400).json({
      status: 400,
      message,
      data: err.code,
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 400,
      message: err.message,
      data: err.details,
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.statusCode,
      message: err.name,
      data: err.message,
    });
    return;
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: err.message,
  });
};
