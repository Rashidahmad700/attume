import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFound: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let details: Record<string, string[]> | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    details = err.flatten().fieldErrors as Record<string, string[]>;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Validation failed';
    details = Object.fromEntries(
      Object.entries(err.errors).map(([key, value]) => [key, [value.message]]),
    );
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    statusCode = 409;
    const keys = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {});
    message = keys.length ? `${keys.join(', ')} already in use` : 'Duplicate value';
  } else if (typeof err === 'object' && err !== null && 'name' in err) {
    const name = (err as { name: string }).name;
    if (name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    } else if (err instanceof Error) {
      message = err.message || message;
    }
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
    ...(env.isProd ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
};
