import 'reflect-metadata';

import { DataSource } from 'typeorm';

import TYPES from '../ioc/types';
import container from '../ioc/inversify.config';

import IORMService from './orm.service.interface';

interface ITypeORMService extends IORMService {
  dataSource: DataSource;
}

const TypeORMService = container.get<ITypeORMService>(TYPES.ORMService);
const ormConfig = TypeORMService.dataSource;
export default ormConfig;
