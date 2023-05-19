import { injectable } from 'inversify';
import { Logger, pino } from 'pino';

import ILogger from './logger.interface';

@injectable()
export default class LoggerService implements ILogger {
  logger: Logger;

  constructor() {
    this.logger = pino({
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    });
  }

  log(...args: unknown[]): void {
    this.info(...args);
  }

  info(...args: unknown[]): void {
    args.forEach((arg) => this.logger.info(arg));
  }

  warn(...args: unknown[]): void {
    args.forEach((arg) => this.logger.warn(arg));
  }

  error(...args: unknown[]): void {
    args.forEach((arg) => this.logger.error(arg));
  }
}
