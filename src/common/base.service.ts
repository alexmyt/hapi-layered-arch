import { injectable } from 'inversify';

import IBaseService from './base.service.interface';

@injectable()
export default abstract class BaseService implements IBaseService {}
