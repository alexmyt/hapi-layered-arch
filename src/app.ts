import { injectable, inject } from 'inversify';
import { Server, ServerRegisterPluginObject } from '@hapi/hapi';
import { pino } from 'pino';

import TYPES from './ioc/types';
import ILogger from './logger/logger.interface';
import IORMService from './database/orm.service.interface';
import IBaseController from './common/base.controller.interface';
import IBaseService from './common/base.service.interface';
import IConfigService from './config/config.service.interface';
import IAuthService from './auth/auth.service.interface';
import IAUthController from './auth/auth.controller.interface';
import IUserController from './users/users.controller.interface';

type IAppModule = IBaseController | IBaseService;

@injectable()
export default class App {
  private isInitialized: boolean;

  private appModules: IAppModule[];

  app: Server;

  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.Config) private configService: IConfigService,
    @inject(TYPES.ORMService) private typeormService: IORMService,

    @inject(TYPES.AuthService) authService: IAuthService,
    @inject(TYPES.AuthController) authController: IAUthController,
    @inject(TYPES.UsersController) usersController: IUserController,
  ) {
    const port = this.configService.get('APP_PORT', 8000);
    this.app = new Server({ port });

    this.appModules = [authService, authController, usersController];
  }

  private async registerAppPlugins(): Promise<void> {
    const loggerPlugin: ServerRegisterPluginObject<unknown> = {
      // eslint-disable-next-line global-require
      plugin: require('hapi-pino'),
      options: {
        instance: this.logger instanceof pino ? this.logger : undefined,
        logRequestComplete: false,
        logEvents: process.env.CI === 'true' || process.env.NODE_ENV === 'test' ? false : undefined,
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    };

    await this.app.register([loggerPlugin]);
  }

  private async registerAppModules(): Promise<void> {
    // ESLint warnings are disabled because Hapi use exactly the same syntax for registering plugins

    // eslint-disable-next-line no-restricted-syntax
    for (const appModule of this.appModules) {
      // eslint-disable-next-line no-await-in-loop
      await this.registerAppModule(appModule);
    }
  }

  private async registerAppModule(appModule: IAppModule): Promise<void> {
    if (appModule.plugins) {
      await this.app.register(appModule.plugins);

      if (appModule.onRegisterPlugins) {
        appModule.onRegisterPlugins.call(appModule, this.app);
      }
    }

    if ('routes' in appModule && appModule.routes) {
      const routes = appModule.routes.map((route) => {
        if (route.handler && typeof route.handler === 'function') {
          return { ...route, handler: route.handler.bind(appModule) };
        }
        return route;
      });

      this.app.route(routes);
    }
  }

  /**
   * Initialize application: register plugins, modules (services and controllers), initialize the ORM.
   */
  public async init(): Promise<void> {
    await this.registerAppPlugins();

    await this.registerAppModules();

    await this.typeormService.initialize();

    this.app.events.on('start', () => this.logger.info(`Server started at ${this.app.info.uri}`));

    this.isInitialized = true;
  }

  /**
   * Starts the server
   */
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
    await this.app.start();
  }

  public async stop(): Promise<void> {
    await this.app.stop();
  }
}
