import { inject, injectable } from 'inversify';
import { DataSource, DataSourceOptions } from 'typeorm';

import TYPES from '../ioc/types';
import IConfigService from '../config/config.service.interface';

import IORMService from './orm.service.interface';

@injectable()
export default class TypeORMService implements IORMService {
  public dataSource: DataSource;

  constructor(@inject(TYPES.Config) private configService: IConfigService) {
    const supportedDBTypes = ['sqlite', 'postgres'];

    const DB_TYPE = this.configService.get<string>('DB_TYPE', 'sqlite');
    if (!supportedDBTypes.includes(DB_TYPE)) {
      throw new Error('Unsupported DB_TYPE');
    }

    let dataSourceOptions: DataSourceOptions;
    if (DB_TYPE === 'postgres') {
      dataSourceOptions = this.postgresOptions();
    } else {
      dataSourceOptions = this.sqliteOptions();
    }

    const NODE_ENV = this.configService.get<string>('NODE_ENV', 'development');
    const isDevelopmentEnv = NODE_ENV.includes('dev');
    const logging = isDevelopmentEnv ? 'all' : false;

    this.dataSource = new DataSource({
      ...dataSourceOptions,
      synchronize: true,
      migrationsRun: false,
      entities: [`${__dirname}/entity/**/*{.ts,.js}`],
      migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
      subscribers: [`${__dirname}/subscribers/**/*{.ts,.js}`],
      logging,
    });
  }

  private postgresOptions(): DataSourceOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      database: this.configService.getOrThrow<string>('DB_NAME'),
      username: this.configService.getOrThrow<string>('DB_USER'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
    };
  }

  private sqliteOptions(): DataSourceOptions {
    return {
      type: 'sqlite',
      database: this.configService.getOrThrow<string>('DB_FILE'),
    };
  }

  public async initialize(): Promise<void> {
    await this.dataSource.initialize();
  }

  public async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}
