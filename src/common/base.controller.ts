import { injectable } from 'inversify';
import { ServerRoute } from '@hapi/hapi';

import { ILogger } from '../logger';

import IBaseController from './base.controller.interface';

@injectable()
export default abstract class BaseController implements IBaseController {
  logger: ILogger;

  abstract routes: ServerRoute[];

  constructor(logger: ILogger) {
    this.logger = logger;
  }
}
