import { Container } from 'inversify';

import App from '../app';
import { ILogger, LoggerService } from '../logger';
import IConfigService from '../config/config.service.interface';
import ConfigService from '../config/config.service';
import IORMService from '../database/orm.service.interface';
import TypeORMService from '../database/typeorm.service';
import IUserController from '../users/users.controller.interface';
import UsersController from '../users/users.controller';
import IUsersService from '../users/users.service.interface';
import UsersService from '../users/users.service';
import IUsersRepository from '../users/users.repository.interface';
import UsersRepository from '../users/users.repository';
import IAuthService from '../auth/auth.service.interface';
import AuthService from '../auth/auth.service';
import IAUthController from '../auth/auth.controller.interface';
import AuthController from '../auth/auth.controller';

import TYPES from './types';

const container = new Container({ defaultScope: 'Singleton' });
container.bind<App>(TYPES.Application).to(App);
container.bind<ILogger>(TYPES.Logger).to(LoggerService);
container.bind<IConfigService>(TYPES.Config).to(ConfigService);
container.bind<IORMService>(TYPES.ORMService).to(TypeORMService);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IAUthController>(TYPES.AuthController).to(AuthController);

container.bind<IUserController>(TYPES.UsersController).to(UsersController);
container.bind<IUsersService>(TYPES.UsersService).to(UsersService);
container.bind<IUsersRepository>(TYPES.UsersRepository).to(UsersRepository);

export default container;
