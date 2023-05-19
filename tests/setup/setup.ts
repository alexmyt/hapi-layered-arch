import 'reflect-metadata';

import { DataSource } from 'typeorm';

import TYPES from '../../src/ioc/types';
import container from '../../src/ioc/inversify.config';
import IORMService from '../../src/database/orm.service.interface';
import IUsersService from '../../src/users/users.service.interface';
import UserEntity from '../../src/database/entity/user';

interface ITypeORMService extends IORMService {
  dataSource: DataSource;
}

const setup = async (): Promise<void> => {
  const ORMService = container.get<ITypeORMService>(TYPES.ORMService);
  await ORMService.initialize();

  await ORMService.dataSource.getRepository(UserEntity).clear();

  const userService = container.get<IUsersService>(TYPES.UsersService);
  await userService.createUser({ name: 'user1', email: 'user1@dot.com', password: 'User1' });
  await userService.createUser({ name: 'user2', email: 'user2@dot.com', password: 'User2' });

  await ORMService.disconnect();
};

export default setup;
