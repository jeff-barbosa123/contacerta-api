import { Logger } from './logger.js';
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    Logger.log(level, `[${req.method}] ${req.originalUrl} - ${res.statusCode} - ${ms}ms`);
  });
  next();
}