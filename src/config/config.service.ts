import { existsSync } from 'fs';

import { inject, injectable } from 'inversify';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';

import TYPES from '../ioc/types';
import { ILogger } from '../logger';

import IConfigService from './config.service.interface';

@injectable()
export default class ConfigService implements IConfigService {
  private cache: DotenvParseOutput;

  constructor(@inject(TYPES.Logger) private logger: ILogger) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    this.cache = {};

    const result: DotenvConfigOutput = config({
      path:
        // eslint-disable-next-line no-nested-ternary
        process.env.NODE_ENV === 'production'
          ? '.env'
          : existsSync(`.env.${process.env.NODE_ENV}`)
          ? `.env.${process.env.NODE_ENV}`
          : `.env`,
    });

    if (result.error) {
      this.logger.error('Error reading .env file');
    }
  }

  get<T extends string | number>(path: string): T | undefined;
  get<T extends string | number>(path: string, defaultValue: T): T;
  get<T extends string | number>(path: string, defaultValue?: T): T | undefined {
    const cachedValue = this.cache[path];
    if (cachedValue) {
      return cachedValue as unknown as T;
    }

    const envValue = process.env[path];
    if (envValue) {
      this.cache[path] = envValue;
      return envValue as unknown as T;
    }

    return defaultValue;
  }

  getOrThrow<T extends string | number>(path: string): T {
    const value = this.get(path);

    if (value === undefined) {
      throw new TypeError(`${path} does not exist`);
    }

    return value as unknown as T;
  }
}
